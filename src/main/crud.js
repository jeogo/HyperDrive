import { join } from 'path'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmdirSync,
  writeFileSync,
  readFileSync
} from 'fs'
import { shell, app } from 'electron'
import { MongoClient } from 'mongodb' // MongoDB Client for database connection
import { networkInterfaces } from 'os'

// Constants for MongoDB
const MONGO_URI =
  'mongodb+srv://admin:admin@dcs.2udsw.mongodb.net/?retryWrites=true&w=majority&appName=DCS' // MongoDB connection string
const DATABASE_NAME = 'test' // Change to your database name
const CLIENT_COLLECTION = 'clients'

// Determine if running in development or production
const baseDir = app.isPackaged
  ? join(process.resourcesPath, 'Clients')
  : join(__dirname, '../Clients')
const clientsFilePath = app.isPackaged
  ? join(process.resourcesPath, 'Clients.json')
  : join(__dirname, '../Clients.json')

// Ensure that the Clients folder and Clients.json file exist
if (!existsSync(baseDir)) {
  mkdirSync(baseDir, { recursive: true })
}
if (!existsSync(clientsFilePath)) {
  writeFileSync(clientsFilePath, JSON.stringify([]))
}

// MongoDB connection function
let dbClient
const connectToDatabase = async () => {
  try {
    if (!dbClient) {
      const client = new MongoClient(MONGO_URI)
      await client.connect()
      dbClient = client.db(DATABASE_NAME)
      console.log('Connected to MongoDB')
    }
    return dbClient
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw new Error('MongoDB connection failed')
  }
}

// Function to check for internet connection
const hasInternetConnection = () => {
  const nets = networkInterfaces()
  let hasInternet = false
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        hasInternet = true
        break
      }
    }
  }
  return hasInternet
}

// Sync all clients from the local JSON file to MongoDB
const syncClientsWithMongoDB = async () => {
  try {
    if (hasInternetConnection()) {
      const clients = readClientsFile() // Read all clients from Clients.json
      const db = await connectToDatabase() // Connect to MongoDB
      const collection = db.collection(CLIENT_COLLECTION)

      // Loop through each client and ensure all fields are set
      for (const client of clients) {
        // Set defaults for missing fields to ensure everything is synced
        const clientWithDefaults = {
          ...client,
          depositSubmitted: client.depositSubmitted !== undefined ? client.depositSubmitted : false,
          printed: client.printed !== undefined ? client.printed : false,
          tests: {
            trafficLawTest: {
              passed: client.tests?.trafficLawTest?.passed || false,
              attempts: client.tests?.trafficLawTest?.attempts || 0,
              lastAttemptDate: client.tests?.trafficLawTest?.lastAttemptDate || null
            },
            manoeuvresTest: {
              passed: client.tests?.manoeuvresTest?.passed || false,
              attempts: client.tests?.manoeuvresTest?.attempts || 0,
              lastAttemptDate: client.tests?.manoeuvresTest?.lastAttemptDate || null
            },
            drivingTest: {
              passed: client.tests?.drivingTest?.passed || false,
              attempts: client.tests?.drivingTest?.attempts || 0,
              lastAttemptDate: client.tests?.drivingTest?.lastAttemptDate || null
            }
          }
        }

        await collection.replaceOne(
          { national_id: client.national_id }, // Find client by national_id in MongoDB
          clientWithDefaults, // Replace the full client object in MongoDB with all fields
          { upsert: true } // Insert the document if it doesn't exist
        )
      }
      console.log('All clients successfully synced with MongoDB.')
    } else {
      console.warn('No internet connection. Syncing skipped.')
    }
  } catch (error) {
    console.error('Error syncing clients with MongoDB:', error)
  }
}

// Function to read clients from the local file
const readClientsFile = () => {
  try {
    const data = readFileSync(clientsFilePath)
    return JSON.parse(data)
  } catch (error) {
    throw new Error(`Failed to read clients file: ${error.message}`)
  }
}

// Function to write clients to the local file
const writeClientsFile = (data) => {
  try {
    writeFileSync(clientsFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    throw new Error(`Failed to write clients file: ${error.message}`)
  }
}

// Function to generate client folder path
export const generateClientPath = (firstName, lastName) => {
  try {
    return join(baseDir, `${firstName}_${lastName}`)
  } catch (error) {
    throw new Error(`Failed to generate client path: ${error.message}`)
  }
}

// CRUD Operations

// Create a new client
export const createClient = async (clientData) => {
  try {
    const clients = readClientsFile()

    // Check if the client already exists by national ID
    if (clients.some((client) => client.national_id === clientData.national_id)) {
      throw new Error(`Client with national_id ${clientData.national_id} already exists.`)
    }

    // Create client folder if not exists
    const folderPath = generateClientPath(clientData.first_name_ar, clientData.last_name_ar)
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true })
    }

    // Add client data locally and set initial values
    clientData.path = folderPath
    clientData.depositSubmitted = clientData.depositSubmitted || false
    clientData.printed = clientData.printed || false
    clientData.tests = clientData.tests || {
      lawTest: { passed: false, attempts: 0, lastAttemptDate: null },
      drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
    }

    clients.push(clientData)
    writeClientsFile(clients) // Save the client locally

    // Sync with MongoDB if online
    await syncClientsWithMongoDB()

    return clientData
  } catch (error) {
    throw new Error(`Failed to create client: ${error.message}`)
  }
}

// Read all clients
export const readClients = () => {
  try {
    return readClientsFile() // Return all clients from the local file
  } catch (error) {
    throw new Error(`Failed to read clients: ${error.message}`)
  }
}

// Update client data
export const updateClient = async (nationalId, updatedData) => {
  try {
    const clients = readClientsFile()
    const index = clients.findIndex((client) => client.national_id === nationalId)

    if (index === -1) {
      throw new Error(`Client with national_id ${nationalId} not found.`)
    }

    // Update client information locally
    clients[index] = { ...clients[index], ...updatedData }
    writeClientsFile(clients)

    // Sync updated client with MongoDB
    await syncClientsWithMongoDB()

    return clients[index]
  } catch (error) {
    throw new Error(`Failed to update client: ${error.message}`)
  }
}

// Delete client locally (only local deletion, no deletion from MongoDB)
export const deleteClient = (nationalId) => {
  try {
    let clients = readClientsFile()
    const client = clients.find((client) => client.national_id === nationalId)
    if (!client) {
      throw new Error(`Client with national_id ${nationalId} not found.`)
    }

    // Remove client locally
    clients = clients.filter((client) => client.national_id !== nationalId)
    writeClientsFile(clients)

    // Remove local client folder
    const folderPath = client.path
    if (folderPath && existsSync(folderPath)) {
      rmdirSync(folderPath, { recursive: true })
    }

    return true
  } catch (error) {
    throw new Error(`Failed to delete client: ${error.message}`)
  }
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

// Open a folder in file explorer
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

// Initial sync of all clients on startup
syncClientsWithMongoDB()
