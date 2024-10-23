// crud.js

import { join } from 'path'
import { app, shell } from 'electron'
import Datastore from 'nedb'
import { existsSync, mkdirSync, readdirSync, renameSync, rmdirSync } from 'fs'

// Determine the base directory based on whether the app is packaged
const baseDir = app.isPackaged
  ? join(process.resourcesPath, 'Clients')
  : join(__dirname, '../Clients')

// Ensure the Clients directory exists
if (!existsSync(baseDir)) {
  mkdirSync(baseDir, { recursive: true })
}

// Initialize NeDB database
const dbFilePath = join(baseDir, 'clients.db')
const db = new Datastore({ filename: dbFilePath, autoload: true })

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
export const createClient = (clientData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create client folder if not exists
      const folderPath = generateClientPath(clientData.first_name_ar, clientData.last_name_ar)
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true })
      }

      // Add client data and set initial values
      clientData.path = folderPath
      clientData.depositSubmitted = clientData.depositSubmitted || false
      clientData.printed = clientData.printed || false
      clientData.tests = clientData.tests || {
        trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null },
        manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null },
        drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
      }

      // Insert the new client into the NeDB database
      db.insert(clientData, (err, newDoc) => {
        if (err) {
          reject(new Error(`Failed to create client: ${err.message}`))
        } else {
          resolve(newDoc)
        }
      })
    } catch (error) {
      reject(new Error(`Failed to create client: ${error.message}`))
    }
  })
}

// Read all clients
export const readClients = () => {
  return new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) {
        reject(new Error(`Failed to read clients: ${err.message}`))
      } else {
        resolve(docs)
      }
    })
  })
}

// Update client data
export const updateClient = (clientId, updatedData) => {
  return new Promise((resolve, reject) => {
    db.update({ _id: clientId }, { $set: updatedData }, {}, (err, numReplaced) => {
      if (err) {
        reject(new Error(`Failed to update client: ${err.message}`))
      } else if (numReplaced === 0) {
        reject(new Error(`Client with ID ${clientId} not found.`))
      } else {
        // Return the updated client
        db.findOne({ _id: clientId }, (err, doc) => {
          if (err) {
            reject(new Error(`Failed to retrieve updated client: ${err.message}`))
          } else {
            resolve(doc)
          }
        })
      }
    })
  })
}

// Delete client
export const deleteClient = (clientId) => {
  return new Promise((resolve, reject) => {
    // Find the client to get the folder path
    db.findOne({ _id: clientId }, (err, client) => {
      if (err) {
        reject(new Error(`Failed to find client: ${err.message}`))
      } else if (!client) {
        reject(new Error(`Client with ID ${clientId} not found.`))
      } else {
        // Remove client from the database
        db.remove({ _id: clientId }, {}, (err) => {
          if (err) {
            reject(new Error(`Failed to delete client: ${err.message}`))
          } else {
            // Remove local client folder
            const folderPath = client.path
            if (folderPath && existsSync(folderPath)) {
              rmdirSync(folderPath, { recursive: true })
            }
            resolve(true)
          }
        })
      }
    })
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
