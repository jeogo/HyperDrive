// preload.js

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Client CRUD operations
  generateClientPath: async (firstName, lastName) => {
    try {
      return await ipcRenderer.invoke('generate-client-path', firstName, lastName)
    } catch (error) {
      console.error('Failed to generate client path:', error)
    }
  },

  createClient: async (clientData) => {
    try {
      return await ipcRenderer.invoke('create-client', clientData)
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  },

  readClients: async () => {
    try {
      return await ipcRenderer.invoke('read-clients')
    } catch (error) {
      console.error('Failed to read clients:', error)
    }
  },

  updateClient: async (clientId, updatedData) => {
    try {
      return await ipcRenderer.invoke('update-client', clientId, updatedData)
    } catch (error) {
      console.error(`Failed to update client with ID ${clientId}:`, error)
    }
  },

  deleteClient: async (clientId) => {
    try {
      return await ipcRenderer.invoke('delete-client', clientId)
    } catch (error) {
      console.error(`Failed to delete client with ID ${clientId}:`, error)
    }
  },

  // Folder management operations
  createFolder: async (folderName) => {
    try {
      return await ipcRenderer.invoke('create-folder', folderName)
    } catch (error) {
      console.error(`Failed to create folder with name ${folderName}:`, error)
    }
  },

  readFolders: async () => {
    try {
      return await ipcRenderer.invoke('read-folders')
    } catch (error) {
      console.error('Failed to read folders:', error)
    }
  },

  updateFolder: async (oldName, newName) => {
    try {
      return await ipcRenderer.invoke('update-folder', oldName, newName)
    } catch (error) {
      console.error(`Failed to update folder from ${oldName} to ${newName}:`, error)
    }
  },

  deleteFolder: async (folderName) => {
    try {
      return await ipcRenderer.invoke('delete-folder', folderName)
    } catch (error) {
      console.error(`Failed to delete folder with name ${folderName}:`, error)
    }
  },

  openFolder: async (folderPath) => {
    try {
      return await ipcRenderer.invoke('open-folder', folderPath)
    } catch (error) {
      console.error(`Failed to open folder at path ${folderPath}:`, error)
    }
  },

  // PDF Generation and Opening
  generatePDF: async (templateName, clientData) => {
    try {
      return await ipcRenderer.invoke('generate-pdf', { templateName, clientData })
    } catch (error) {
      console.error(`Failed to generate PDF with template ${templateName}:`, error)
    }
  },

  openPath: async (filePath) => {
    try {
      return await ipcRenderer.invoke('open-path', filePath)
    } catch (error) {
      console.error('Failed to open path:', error)
    }
  }
})
