import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs'
import { registerIpcHandlers } from './ipcHandlers'

// Utility to log errors
const logErrorToFile = (error) => {
  const errorLogPath = join(app.getPath('userData'), 'logs', 'error.log')
  const logsFolderPath = join(app.getPath('userData'), 'logs')

  if (!existsSync(logsFolderPath)) {
    mkdirSync(logsFolderPath, { recursive: true })
  }

  const errorMessage = `${new Date().toISOString()} - Error: ${error.stack || error.message || error}\n`
  appendFileSync(errorLogPath, errorMessage)
}

// Function to show error in a user-friendly way (for frontend)
const showErrorToUser = (window, message) => {
  dialog.showMessageBox(window, {
    type: 'error',
    title: 'Application Error',
    message: 'An error occurred in the application',
    detail: message,
    buttons: ['OK']
  })
}

function createWindow() {
  let mainWindow

  try {
    // Set icon for both development and production
    const iconPath = is.dev
      ? join(__dirname, '../../resources/icon.png') // Development icon path
      : join(app.getAppPath(), 'resources', 'icon.png') // Production icon path

    mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false, // Hide initially
      autoHideMenuBar: true,
      icon: iconPath, // Use the iconPath variable
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        nodeIntegration: false
      }
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.webContents.on('did-fail-load', () => {
      console.error('Failed to load the renderer process.')
      mainWindow.show() // Ensure window shows even if loading fails
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch((err) => {
        logErrorToFile(err)
        showErrorToUser(mainWindow, 'Failed to load renderer process.')
        mainWindow.show()
      })
    }

    mainWindow.on('closed', () => {
      console.log('Main window closed')
    })
  } catch (error) {
    logErrorToFile(error)
    if (mainWindow) {
      showErrorToUser(mainWindow, 'Failed to create the main window.')
    }
  }
}

function ensureClientsFolder() {
  const clientsFolderPath = join(app.getPath('userData'), 'Clients')
  const clientsFilePath = join(clientsFolderPath, 'Clients.json')

  try {
    if (!existsSync(clientsFolderPath)) {
      mkdirSync(clientsFolderPath, { recursive: true })
      console.log('Clients folder created at:', clientsFolderPath)
    }

    if (!existsSync(clientsFilePath)) {
      writeFileSync(clientsFilePath, JSON.stringify([]))
      console.log('Clients.json file created at:', clientsFilePath)
    }
  } catch (error) {
    logErrorToFile(error)
    if (BrowserWindow.getAllWindows().length > 0) {
      showErrorToUser(
        BrowserWindow.getFocusedWindow(),
        'Failed to ensure Clients folder and file exist.'
      )
    }
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.guenfoude.autoschoolmanager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ensureClientsFolder() // Ensure Clients folder and Clients.json are created
  registerIpcHandlers() // Register IPC handlers
  createWindow() // Create the main application window

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Catch all unhandled errors
process.on('uncaughtException', (error) => {
  logErrorToFile(error)
  console.error('Unhandled exception:', error)

  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    showErrorToUser(window, 'An unexpected error occurred. Please restart the application.')
  }
})

process.on('unhandledRejection', (reason, promise) => {
  logErrorToFile(reason)
  console.error('Unhandled promise rejection:', promise, 'reason:', reason)

  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    showErrorToUser(window, 'An unexpected error occurred. Please restart the application.')
  }
})
