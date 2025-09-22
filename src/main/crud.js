import { join } from 'path'
import { app, shell } from 'electron'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmdirSync,
  readFileSync,
  writeFileSync
} from 'fs'

// Determine the base directory based on whether the app is packaged
const baseDir = app.isPackaged
  ? join(app.getPath('userData'), 'Clients')
  : join(process.cwd(), 'out', 'Clients')

// Ensure the Clients directory exists
if (!existsSync(baseDir)) {
  mkdirSync(baseDir, { recursive: true })
}

// JSON Database file path
const dbFilePath = join(baseDir, 'Clients.json')

// Initialize JSON database
let clientsDB = []
let clientIndex = new Map() // Index for faster lookups by ID

// Smart caching system for performance
let cacheTimestamp = 0
let cachedClients = null
const CACHE_TTL = 30000 // 30 seconds cache

// Hoisted cache invalidation function (must be defined before loadDatabase -> saveDatabase migration calls)
export function invalidateCache() {
  cachedClients = null
  cacheTimestamp = 0
}

// Function to get cached clients or load fresh data
const getCachedClients = () => {
  const now = Date.now()
  if (cachedClients && now - cacheTimestamp < CACHE_TTL) {
    return cachedClients
  }
  return null
}

// Function to update cache
const updateCache = (data) => {
  cachedClients = [...data] // Create a copy to avoid mutations
  cacheTimestamp = Date.now()
}

// Function to load data from JSON file
const loadDatabase = () => {
  try {
    if (existsSync(dbFilePath)) {
      const data = readFileSync(dbFilePath, 'utf-8')
      clientsDB = JSON.parse(data)

      // Migration: Fix old paths
      let migrationNeeded = false
      clientsDB.forEach((client, index) => {
        if (client.path && (client.path.includes('Desktop') || client.path.includes('Copy'))) {
          // Generate new safe path
          const safeFirstName = sanitizeFolderName(client.first_name_ar)
          const safeLastName = sanitizeFolderName(client.last_name_ar)
          const timestamp = (index + 1).toString().padStart(3, '0')
          client.path = join(baseDir, `${safeFirstName}_${safeLastName}_${timestamp}`)
          migrationNeeded = true
        }

        // Migration: Add missing _id fields for existing clients
        if (!client._id) {
          client._id = generateId()
          migrationNeeded = true
        }
      })

      if (migrationNeeded) {
        saveDatabase()
        console.log('Database migrated: paths fixed and missing _id fields added')
      }

      // Rebuild index
      rebuildIndex()
    } else {
      clientsDB = []
    }
  } catch (error) {
    console.error('Error loading database:', error)
    clientsDB = []
  }
}

// Function to save data to JSON file
const saveDatabase = () => {
  try {
    const data = JSON.stringify(clientsDB, null, 2)
    writeFileSync(dbFilePath, data, 'utf8')
    // Invalidate cache when data changes for consistency
    if (typeof invalidateCache === 'function') invalidateCache()
  } catch (error) {
    console.error('Error saving database:', error)
    throw new Error(`Failed to save database: ${error.message}`)
  }
}

// Function to build index for faster lookups
const rebuildIndex = () => {
  clientIndex.clear()
  clientsDB.forEach((client, index) => {
    if (client._id) {
      clientIndex.set(client._id, index)
    }
  })
}

// Function to generate unique ID
const generateId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `${timestamp}-${random}`
}

// Function to sanitize Arabic names for safe folder creation
const sanitizeFolderName = (name) => {
  if (!name || typeof name !== 'string') return 'unknown'

  // Enhanced Unicode-safe sanitization
  return (
    name
      .trim()
      .replace(/[<>:"/\\|?*]/g, '') // Remove Windows invalid chars
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F]/g, '') // Remove control chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(
        /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9_-]/g,
        ''
      ) // Keep only Arabic, Latin, numbers, underscore, dash
      .substring(0, 30) || 'client' // Limit length with fallback
  )
}

// Function to generate client folder path with safe naming
export const generateClientPath = (firstName, lastName) => {
  try {
    const safeFirstName = sanitizeFolderName(firstName)
    const safeLastName = sanitizeFolderName(lastName)
    const timestamp = Date.now().toString().slice(-6) // Add timestamp to ensure uniqueness
    return join(baseDir, `${safeFirstName}_${safeLastName}_${timestamp}`)
  } catch (error) {
    throw new Error(`Failed to generate client path: ${error.message}`)
  }
}

// Initialize database on module load
loadDatabase()

// Find client by ID (using index for performance)
const findClientById = (clientId) => {
  const index = clientIndex.get(clientId)
  if (index !== undefined && clientsDB[index]) {
    return { client: clientsDB[index], index }
  }
  return null
}

// CRUD Operations with full history tracking

// Create a new client with historical tracking
export const createClient = (clientData) => {
  return new Promise((resolve, reject) => {
    try {
      const folderPath = generateClientPath(clientData.first_name_ar, clientData.last_name_ar)
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true })
      }

      // Generate unique ID
      const clientId = generateId()

      // Initialize client data with historic fields
      const newClient = {
        ...clientData,
        _id: clientId,
        path: folderPath,
        depositSubmitted: clientData.depositSubmitted || false,
        printed: clientData.printed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // History fields
        paymentHistory: [],
        editHistory: [],
        examHistory: [],
        submissionHistory: [],
        archiveHistory: [],

        tests: clientData.tests || {
          trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null },
          manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null },
          drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
        }
      }

      // Add to database
      clientsDB.push(newClient)
      clientIndex.set(clientId, clientsDB.length - 1)

      // Save to file (cache automatically invalidated)
      saveDatabase()

      resolve(newClient)
    } catch (error) {
      reject(new Error(`Failed to create client: ${error.message}`))
    }
  })
}

// Read all clients - FAST with caching
export const readClients = () => {
  return new Promise((resolve, reject) => {
    try {
      // Check cache first for speed
      const cached = getCachedClients()
      if (cached) {
        resolve([...cached]) // Return cached copy
        return
      }

      // Load fresh data if cache miss
      loadDatabase()
      updateCache(clientsDB)
      resolve([...clientsDB]) // Return copy to prevent mutations
    } catch (error) {
      reject(new Error(`Failed to read clients: ${error.message}`))
    }
  })
}

// Update client with historical tracking for edits
export const updateClient = (clientId, updatedData, editedFields = []) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result
      const currentDate = new Date().toISOString()

      // Track edited fields with old and new values
      if (editedFields.length > 0) {
        const editRecord = {
          date: currentDate,
          changes: editedFields.map((field) => ({
            field,
            oldValue: client[field],
            newValue: updatedData[field]
          }))
        }
        updatedData.editHistory = [...(client.editHistory || []), editRecord]
      }

      // Update client data
      const updatedClient = {
        ...client,
        ...updatedData,
        updated_at: currentDate
      }

      // Update in database
      clientsDB[index] = updatedClient

      // Save to file
      saveDatabase()

      resolve(updatedClient)
    } catch (error) {
      reject(new Error(`Failed to update client: ${error.message}`))
    }
  })
}

// Add payment to client's payment history
export const addPayment = (clientId, amount) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result
      const paymentRecord = {
        date: new Date().toISOString(),
        amount
      }

      const updatedClient = {
        ...client,
        paymentHistory: [...(client.paymentHistory || []), paymentRecord],
        updated_at: new Date().toISOString()
      }

      clientsDB[index] = updatedClient
      saveDatabase()

      resolve(`Payment of ${amount} added for client ${clientId}`)
    } catch (error) {
      reject(new Error(`Failed to update payment history: ${error.message}`))
    }
  })
}

// Record an exam attempt for a client with historic tracking
export const recordExamAttempt = (clientId, examType, passed) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result
      const examRecord = {
        date: new Date().toISOString(),
        examType,
        passed
      }

      const updatedClient = {
        ...client,
        examHistory: [...(client.examHistory || []), examRecord],
        updated_at: new Date().toISOString()
      }

      clientsDB[index] = updatedClient
      saveDatabase()

      resolve(`Exam attempt recorded for client ${clientId}`)
    } catch (error) {
      reject(new Error(`Failed to update exam history: ${error.message}`))
    }
  })
}

// Record submission history for a client
export const recordSubmission = (clientId, submissionDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result
      const submissionRecord = {
        date: new Date().toISOString(),
        details: submissionDetails
      }

      const updatedClient = {
        ...client,
        submissionHistory: [...(client.submissionHistory || []), submissionRecord],
        updated_at: new Date().toISOString()
      }

      clientsDB[index] = updatedClient
      saveDatabase()

      resolve(`Submission recorded for client ${clientId}`)
    } catch (error) {
      reject(new Error(`Failed to update submission history: ${error.message}`))
    }
  })
}

// Archive a client and add it to archive history
export const archiveClient = (clientId, action) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result
      const archiveRecord = {
        date: new Date().toISOString(),
        action: action === 'archive' ? 'Archived' : 'Unarchived'
      }

      const updatedClient = {
        ...client,
        archived: action === 'archive',
        archiveHistory: [...(client.archiveHistory || []), archiveRecord],
        updated_at: new Date().toISOString()
      }

      clientsDB[index] = updatedClient
      saveDatabase()

      resolve(`Client ${clientId} successfully ${action === 'archive' ? 'archived' : 'unarchived'}`)
    } catch (error) {
      reject(new Error(`Failed to archive/unarchive client: ${error.message}`))
    }
  })
}

// Delete client with history check
export const deleteClient = (clientId) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }

      const { client, index } = result

      // Remove from database
      clientsDB.splice(index, 1)

      // Rebuild index after deletion
      rebuildIndex()

      // Remove folder if exists
      const folderPath = client.path
      if (folderPath && existsSync(folderPath)) {
        rmdirSync(folderPath, { recursive: true })
      }

      // Save to file
      saveDatabase()

      resolve(true)
    } catch (error) {
      reject(new Error(`Failed to delete client: ${error.message}`))
    }
  })
}

// Search functions for better performance
// Fast search with caching and limit
export const searchClients = (query, limit = 50) => {
  return new Promise((resolve, reject) => {
    try {
      if (!query) {
        resolve([])
        return
      }

      // Use cache for speed
      let data = getCachedClients()
      if (!data) {
        loadDatabase()
        updateCache(clientsDB)
        data = clientsDB
      }

      const queryLower = query.toLowerCase()
      const results = []

      // Fast search through data
      for (const client of data) {
        if (results.length >= limit) break

        // Support both old and new field names
        const searchText = [
          client.first_name_ar,
          client.last_name_ar,
          client.phone || client.phone_number,
          client.nationalId || client.national_id
        ]
          .join(' ')
          .toLowerCase()

        if (searchText.includes(queryLower)) {
          results.push(client)
        }
      }

      resolve(results)
    } catch (error) {
      reject(new Error(`Failed to search clients: ${error.message}`))
    }
  })
}

// Get client by ID
export const getClientById = (clientId) => {
  return new Promise((resolve, reject) => {
    try {
      const result = findClientById(clientId)
      if (!result) {
        reject(new Error(`Client with ID ${clientId} not found.`))
        return
      }
      resolve(result.client)
    } catch (error) {
      reject(new Error(`Failed to get client: ${error.message}`))
    }
  })
}

// Folder Management Functions

export const createFolder = (folderName) => {
  try {
    const folderPath = join(baseDir, folderName)

    if (existsSync(folderPath)) {
      throw new Error(`Folder ${folderName} already exists.`)
    }

    mkdirSync(folderPath)
    return folderName
  } catch (error) {
    throw new Error(`Failed to create folder: ${error.message}`)
  }
}

export const readFolders = () => {
  try {
    return readdirSync(baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    throw new Error(`Failed to read folders: ${error.message}`)
  }
}

export const updateFolder = (oldName, newName) => {
  try {
    const oldFolderPath = join(baseDir, oldName)
    const newFolderPath = join(baseDir, newName)

    if (!existsSync(oldFolderPath)) {
      throw new Error(`Folder ${oldName} does not exist.`)
    }

    if (existsSync(newFolderPath)) {
      throw new Error(`Folder ${newName} already exists.`)
    }

    renameSync(oldFolderPath, newFolderPath)
    return newName
  } catch (error) {
    throw new Error(`Failed to update folder: ${error.message}`)
  }
}

export const deleteFolder = (folderName) => {
  try {
    const folderPath = join(baseDir, folderName)

    if (!existsSync(folderPath)) {
      throw new Error(`Folder ${folderName} does not exist.`)
    }

    rmdirSync(folderPath, { recursive: true })
    return true
  } catch (error) {
    throw new Error(`Failed to delete folder: ${error.message}`)
  }
}

// Open a folder in the file explorer
export const openFolder = (folderPath) => {
  try {
    if (!existsSync(folderPath)) {
      throw new Error(`Folder at path ${folderPath} does not exist.`)
    }

    shell.showItemInFolder(folderPath)
  } catch (error) {
    throw new Error(`Failed to open folder: ${error.message}`)
  }
}

// FAST OPERATIONS - New Performance Functions

// Fast paginated clients - no need to load all data
export const getClientsPaginated = (page = 1, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Use cache if available
      let data = getCachedClients()
      if (!data) {
        loadDatabase()
        updateCache(clientsDB)
        data = clientsDB
      }

      // Apply filters quickly
      let filtered = data
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = data.filter(
          (client) =>
            client.first_name_ar?.toLowerCase().includes(searchLower) ||
            client.last_name_ar?.toLowerCase().includes(searchLower) ||
            client.phone?.includes(filters.search) ||
            client.nationalId?.includes(filters.search)
        )
      }

      if (filters.archived !== undefined) {
        filtered = filtered.filter(
          (client) => Boolean(client.archived || client.isArchived) === filters.archived
        )
      }

      // Pagination
      const total = filtered.length
      const offset = (page - 1) * limit
      const clients = filtered.slice(offset, offset + limit)

      resolve({
        clients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total
      })
    } catch (error) {
      reject(new Error(`Failed to get paginated clients: ${error.message}`))
    }
  })
}

// Invalidate cache when data changes
// (invalidateCache moved above for hoisting safety)

console.log('Clients Base Directory =>', baseDir)
