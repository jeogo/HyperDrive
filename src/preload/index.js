// preload.js

import { contextBridge, ipcRenderer } from 'electron'

const apiMethods = {
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

  // FAST OPERATIONS - Performance Optimized API
  getClientsPaginated: async (page = 1, limit = 50, filters = {}) => {
    try {
      return await ipcRenderer.invoke('get-clients-paginated', page, limit, filters)
    } catch (error) {
      console.error('Failed to get paginated clients:', error)
      return { clients: [], total: 0, page: 1, totalPages: 1, hasMore: false }
    }
  },

  invalidateCache: async () => {
    try {
      return await ipcRenderer.invoke('invalidate-cache')
    } catch (error) {
      console.error('Failed to invalidate cache:', error)
    }
  },

  getClients: async () => {
    try {
      return await ipcRenderer.invoke('read-clients')
    } catch (error) {
      console.error('Failed to get clients:', error)
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

  // Search and get operations
  searchClients: async (query) => {
    try {
      return await ipcRenderer.invoke('search-clients', query)
    } catch (error) {
      console.error('Failed to search clients:', error)
    }
  },

  getClientById: async (clientId) => {
    try {
      return await ipcRenderer.invoke('get-client-by-id', clientId)
    } catch (error) {
      console.error(`Failed to get client with ID ${clientId}:`, error)
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

  // DOCX Generation for deposit portfolio
  generateDepositDocx: async (options = {}) => {
    try {
      return await ipcRenderer.invoke('generate-deposit-docx', options)
    } catch (error) {
      console.error('Failed to generate DOCX:', error)
      throw error
    }
  },

  fillTrafficLawLessonsCard: async (options = {}) => {
    try {
      return await ipcRenderer.invoke('fill-traffic-law-card', options)
    } catch (error) {
      console.error('Failed to fill traffic law lessons card:', error)
      throw error
    }
  },

  fillCandidateFollowUpCard: async (options = {}) => {
    try {
      return await ipcRenderer.invoke('fill-candidate-follow-up-card', options)
    } catch (error) {
      console.error('Failed to fill candidate follow-up card:', error)
      throw error
    }
  },

  openPath: async (filePath) => {
    try {
      return await ipcRenderer.invoke('open-path', filePath)
    } catch (error) {
      console.error('Failed to open path:', error)
    }
  },

  // Record submission for tracking
  recordSubmission: async (clientId, submissionDetails) => {
    try {
      return await ipcRenderer.invoke('record-submission', clientId, submissionDetails)
    } catch (error) {
      console.error(`Failed to record submission for client ${clientId}:`, error)
    }
  },

  // Get submission history for a client
  getSubmissionHistory: async (clientId) => {
    try {
      return await ipcRenderer.invoke('get-submission-history', clientId)
    } catch (error) {
      console.error(`Failed to get submission history for client ${clientId}:`, error)
    }
  }
}

// Expose unified API
contextBridge.exposeInMainWorld('api', apiMethods)
