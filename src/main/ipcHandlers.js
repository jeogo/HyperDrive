// ipcHandlers.js

import { ipcMain, shell } from 'electron'
import fs from 'fs'
import {
  createClient,
  readClients,
  updateClient,
  deleteClient,
  createFolder,
  readFolders,
  updateFolder,
  deleteFolder,
  generateClientPath
} from './crud'
import { generatePDFByTemplateName } from './templateManager'

// Register IPC handlers for CRUD operations with proper error handling
export function registerIpcHandlers() {
  // Client CRUD operations
  ipcMain.handle('create-client', async (event, clientData) => {
    try {
      const newClient = await createClient(clientData)
      return newClient
    } catch (error) {
      console.error('Failed to create client:', error)
      throw new Error(`Failed to create client: ${error.message}`)
    }
  })

  ipcMain.handle('read-clients', async () => {
    try {
      const clients = await readClients()
      return clients
    } catch (error) {
      console.error('Failed to read clients:', error)
      throw new Error('Failed to read clients.')
    }
  })

  ipcMain.handle('update-client', async (event, clientId, updatedData) => {
    try {
      const updatedClient = await updateClient(clientId, updatedData)
      return updatedClient
    } catch (error) {
      console.error('Failed to update client:', error)
      throw new Error(`Failed to update client: ${error.message}`)
    }
  })

  ipcMain.handle('delete-client', async (event, clientId) => {
    try {
      const result = await deleteClient(clientId)
      return result
    } catch (error) {
      console.error('Failed to delete client:', error)
      throw new Error(`Failed to delete client: ${error.message}`)
    }
  })

  // Folder CRUD operations
  ipcMain.handle('create-folder', (event, folderName) => {
    try {
      return createFolder(folderName)
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw new Error(`Failed to create folder: ${error.message}`)
    }
  })

  ipcMain.handle('read-folders', () => {
    try {
      return readFolders()
    } catch (error) {
      console.error('Failed to read folders:', error)
      throw new Error('Failed to read folders.')
    }
  })

  ipcMain.handle('update-folder', (event, oldName, newName) => {
    try {
      return updateFolder(oldName, newName)
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw new Error(`Failed to update folder: ${error.message}`)
    }
  })

  ipcMain.handle('delete-folder', (event, folderName) => {
    try {
      return deleteFolder(folderName)
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw new Error(`Failed to delete folder: ${error.message}`)
    }
  })

  // Open folder handler with error handling
  ipcMain.handle('open-folder', async (event, folderPath) => {
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }) // Create folder if it doesn't exist
        console.log(`Folder created: ${folderPath}`)
      }
      await shell.openPath(folderPath) // Open folder
      return { success: true }
    } catch (error) {
      console.error(`Failed to open folder: ${error.message}`)
      return { success: false, message: `Failed to open folder: ${error.message}` }
    }
  })

  // Handler for generating client path
  ipcMain.handle('generate-client-path', (event, firstName, lastName) => {
    try {
      return generateClientPath(firstName, lastName)
    } catch (error) {
      console.error('Failed to generate client path:', error)
      throw new Error(`Failed to generate client path: ${error.message}`)
    }
  })

  // Handler for generating PDFs
  ipcMain.handle('generate-pdf', async (event, { templateName, clientData }) => {
    try {
      const outputPath = await generatePDFByTemplateName(templateName, clientData)
      return outputPath
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  })

  // Handler for opening the generated PDF
  ipcMain.handle('open-path', async (event, filePath) => {
    try {
      const result = await shell.openPath(filePath)
      if (result) {
        throw new Error(`Error opening path: ${result}`)
      }
      return result
    } catch (error) {
      console.error('Failed to open path:', error)
      throw new Error(`Failed to open path: ${error.message}`)
    }
  })
}
