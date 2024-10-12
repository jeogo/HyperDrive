import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'fs'
import { registerIpcHandlers } from './ipcHandlers'

// Constants
const TRIAL_DURATION_DAYS = 7 // Set trial period to 7 days
const LICENSE_KEY = 'Binladen@1304'

// Determine the correct directory based on dev or production mode
const appDirectory = is.dev ? join(__dirname, '../') : process.cwd() // ../ in dev, ./ in build
const PASSWORD_FILE = join(appDirectory, 'password.txt') // Password file path
const TRIAL_FILE = join(appDirectory, 'trialStart.txt') // Trial file path
const LOGS_DIR = join(appDirectory, 'logs') // Logs directory

// Utility to log errors to a file
const logErrorToFile = (error) => {
  const errorLogPath = join(LOGS_DIR, 'error.log')

  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }

  const errorMessage = `${new Date().toISOString()} - Error: ${error.stack || error.message || error}\n`
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

// Function to display the trial end message
const showTrialEndMessage = (window) => {
  dialog
    .showMessageBox(window, {
      type: 'info',
      title: 'Trial Period Ended',
      message: 'Your trial period for this application has expired.',
      detail: `Please contact the developer to activate the system. \nPhone: 0776863561\nEnter a valid license key to continue using the software.`,
      buttons: ['OK']
    })
    .then(() => {
      app.quit() // Exit the app after showing the message
    })
}

// Function to display successful license activation
const showSuccessMessage = (window) => {
  dialog.showMessageBox(window, {
    type: 'info',
    title: 'Successful Activation',
    message: 'Your license key is valid. The full version has been activated.',
    buttons: ['OK']
  })
}

// Function to prompt the user to enter a license key
const promptForLicenseKey = (window) => {
  dialog
    .showMessageBox(window, {
      type: 'question',
      title: 'Enter License Key',
      message: 'Please enter your license key to activate the program:',
      buttons: ['OK'],
      inputType: 'password',
      noLink: true
    })
    .then(({ response }) => {
      const inputKey = response // Note: Handle input collection in the renderer
      if (inputKey === LICENSE_KEY) {
        writeFileSync(PASSWORD_FILE, LICENSE_KEY) // Save the key in the password file
        showSuccessMessage(window)
      } else {
        dialog.showMessageBox(window, {
          type: 'error',
          title: 'Invalid License Key',
          message: 'The license key entered is invalid. Please try again or contact support.',
          buttons: ['OK']
        })
        app.quit() // Exit if the key is invalid
      }
    })
}

// Function to check the license or trial status
const checkLicenseOrTrial = (window) => {
  // Check if the password file exists
  if (existsSync(PASSWORD_FILE)) {
    const savedKey = readFileSync(PASSWORD_FILE, 'utf-8').trim()
    if (savedKey === LICENSE_KEY) {
      console.log('License key is valid. Full access granted.')
      return true // Full access granted, skip trial
    }
  }

  // Check if the trial file exists
  if (existsSync(TRIAL_FILE)) {
    const trialStart = new Date(readFileSync(TRIAL_FILE, 'utf-8'))
    const now = new Date()
    const diffMs = now - trialStart
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) // Convert ms to days

    // If the trial has expired, show the trial end message
    if (diffDays >= TRIAL_DURATION_DAYS) {
      showTrialEndMessage(window) // Trial has ended, prompt for license
      return false
    } else {
      const remainingDays = TRIAL_DURATION_DAYS - diffDays
      console.log(`Remaining trial time: ${remainingDays} days`)
      return true // Trial is still active
    }
  } else {
    // If trial file doesn't exist, create it and start the trial
    writeFileSync(TRIAL_FILE, new Date().toISOString())
    console.log('Trial started.')
    return true // Trial just started
  }
}

// Ensure password and trial files are created if they don't exist
const ensureFilesExist = () => {
  if (!existsSync(PASSWORD_FILE)) {
    writeFileSync(PASSWORD_FILE, '') // Create empty password file if it doesn't exist
    console.log('Password file created.')
  }

  if (!existsSync(TRIAL_FILE)) {
    writeFileSync(TRIAL_FILE, new Date().toISOString()) // Create trial file if it doesn't exist
    console.log('Trial file created.')
  }
}

function createWindow() {
  let mainWindow

  try {
    const iconPath = is.dev
      ? join(__dirname, '../../resources/icon.png') // Development icon path
      : join(app.getAppPath(), 'resources', 'icon.png') // Production icon path

    mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      icon: iconPath,
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
      mainWindow.show()
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
        showErrorToUser(mainWindow, 'Failed to load the user interface.')
        mainWindow.show()
      })
    }

    mainWindow.on('closed', () => {
      console.log('Main window closed')
    })

    // **Check License or Trial at Startup**
    const hasAccess = checkLicenseOrTrial(mainWindow)
    if (!hasAccess) {
      promptForLicenseKey(mainWindow) // Ask for the license key if trial ends
    }
  } catch (error) {
    logErrorToFile(error)
    if (mainWindow) {
      showErrorToUser(mainWindow, 'Failed to create the main window.')
    }
  }
}

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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.example.autoschoolmanager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ensureFilesExist()
  ensureClientsFolder()
  registerIpcHandlers()
  createWindow()

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
