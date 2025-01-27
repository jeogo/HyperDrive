import { app, shell, BrowserWindow, dialog, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs'
import { registerIpcHandlers } from './ipcHandlers'

// Determine the correct directory based on dev or production mode
const appDirectory = is.dev ? join(__dirname, '../') : process.cwd() // ../ in dev, ./ in build
const LOGS_DIR = join(appDirectory, 'logs') // Logs directory

// Utility to log errors to a file
const logErrorToFile = (error) => {
  const errorLogPath = join(LOGS_DIR, 'error.log')

  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }

  const errorMessage = `${new Date().toISOString()} - Error: ${
    error.stack || error.message || error
  }\n`
  appendFileSync(errorLogPath, errorMessage)
}

// Display user-friendly error messages
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
    // Set the icon path based on the environment
    const iconPath = is.dev
      ? join(__dirname, '../../resources/icon.png') // Development icon path
      : join(app.getAppPath(), 'resources', 'icon.png') // Production icon path

    // Get the screen dimensions to create a full-screen window
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    mainWindow = new BrowserWindow({
      width, // Full width of the screen
      height, // Full height of the screen
      show: false,
      autoHideMenuBar: true, // Hide menu bar for a clean UI
      icon: iconPath,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'), // Preload script
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        nodeIntegration: false // Disable node integration for security
      }
    })

    // Show window when ready to avoid white screen
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // Error handling for page loading failure
    mainWindow.webContents.on('did-fail-load', () => {
      console.error('Failed to load the renderer process.')
      mainWindow.show()
    })

    // Prevent opening new browser windows from external URLs
    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url) // Open URLs in the user's default browser
      return { action: 'deny' } // Prevent in-app window opening
    })

    // Load the appropriate URL based on development or production
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch((err) => {
        logErrorToFile(err)
        showErrorToUser(mainWindow, 'Failed to load the user interface.')
        mainWindow.show()
      })
    }

    // Log when the window is closed
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

// Ensure the Clients folder and file are created if they don't exist
function ensureClientsFolder() {
  const clientsFolderPath = join(appDirectory, 'Clients')
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

// Main application lifecycle management
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.example.autoschoolmanager')

  // Watch for browser window events
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Ensure the necessary folders and files are created
  ensureClientsFolder()
  registerIpcHandlers() // Register IPC handlers for communication between front and back end
  createWindow() // Create the main window

  // Recreate the window if the app is re-activated and no windows are open
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit the app when all windows are closed (except for macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Global error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logErrorToFile(error)
  console.error('Unhandled exception:', error)

  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    showErrorToUser(window, 'An unexpected error occurred. Please restart the application.')
  }
})

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logErrorToFile(reason)
  console.error('Unhandled promise rejection:', promise, 'reason:', reason)

  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    showErrorToUser(window, 'An unexpected error occurred. Please restart the application.')
  }
})
