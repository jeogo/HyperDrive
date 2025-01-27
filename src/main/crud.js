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

// CRUD Operations with full history tracking

// Create a new client with historical tracking for payments, edits, submissions, and exams
export const createClient = (clientData) => {
  return new Promise((resolve, reject) => {
    try {
      const folderPath = generateClientPath(clientData.first_name_ar, clientData.last_name_ar)
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true })
      }

      // Initialize client data with historic fields
      clientData.path = folderPath
      clientData.depositSubmitted = clientData.depositSubmitted || false
      clientData.printed = clientData.printed || false

      // History fields
      clientData.paymentHistory = [] // Track all payments
      clientData.editHistory = [] // Track all edits
      clientData.examHistory = [] // Track all exam attempts
      clientData.submissionHistory = [] // Track all deposit submissions
      clientData.archiveHistory = [] // Track archival actions (archive/unarchive)

      clientData.tests = clientData.tests || {
        trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null },
        manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null },
        drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
      }

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

// Update client with historical tracking for edits
export const updateClient = (clientId, updatedData, editedFields = []) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client with ID ${clientId}.`))
        return
      }

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
        updatedData.editHistory = [...client.editHistory, editRecord]
      }

      db.update({ _id: clientId }, { $set: updatedData }, {}, (err, numReplaced) => {
        if (err) {
          reject(new Error(`Failed to update client: ${err.message}`))
        } else if (numReplaced === 0) {
          reject(new Error(`Client with ID ${clientId} not found.`))
        } else {
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
  })
}

// Add payment to client's payment history
export const addPayment = (clientId, amount) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client with ID ${clientId}.`))
        return
      }

      const paymentRecord = {
        date: new Date().toISOString(),
        amount
      }

      db.update(
        { _id: clientId },
        { $push: { paymentHistory: paymentRecord } },
        {},
        (err, numReplaced) => {
          if (err) {
            reject(new Error(`Failed to update payment history: ${err.message}`))
          } else {
            resolve(`Payment of ${amount} added for client ${clientId}`)
          }
        }
      )
    })
  })
}

// Record an exam attempt for a client with historic tracking
export const recordExamAttempt = (clientId, examType, passed) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client with ID ${clientId}.`))
        return
      }

      const examRecord = {
        date: new Date().toISOString(),
        examType,
        passed
      }

      db.update(
        { _id: clientId },
        { $push: { examHistory: examRecord } },
        {},
        (err, numReplaced) => {
          if (err) {
            reject(new Error(`Failed to update exam history: ${err.message}`))
          } else {
            resolve(`Exam attempt recorded for client ${clientId}`)
          }
        }
      )
    })
  })
}

// Record submission history for a client
export const recordSubmission = (clientId, submissionDetails) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client with ID ${clientId}.`))
        return
      }

      const submissionRecord = {
        date: new Date().toISOString(),
        details: submissionDetails
      }

      db.update(
        { _id: clientId },
        { $push: { submissionHistory: submissionRecord } },
        {},
        (err, numReplaced) => {
          if (err) {
            reject(new Error(`Failed to update submission history: ${err.message}`))
          } else {
            resolve(`Submission recorded for client ${clientId}`)
          }
        }
      )
    })
  })
}

// Archive a client and add it to archive history
export const archiveClient = (clientId, action) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client with ID ${clientId}.`))
        return
      }

      const archiveRecord = {
        date: new Date().toISOString(),
        action: action === 'archive' ? 'Archived' : 'Unarchived'
      }

      const updatedClientData = { archived: action === 'archive' }

      db.update(
        { _id: clientId },
        { $set: updatedClientData, $push: { archiveHistory: archiveRecord } },
        {},
        (err, numReplaced) => {
          if (err) {
            reject(new Error(`Failed to archive/unarchive client: ${err.message}`))
          } else {
            resolve(
              `Client ${clientId} successfully ${action === 'archive' ? 'archived' : 'unarchived'}`
            )
          }
        }
      )
    })
  })
}

// Delete client with history check
export const deleteClient = (clientId) => {
  return new Promise((resolve, reject) => {
    db.findOne({ _id: clientId }, (err, client) => {
      if (err || !client) {
        reject(new Error(`Failed to find client: ${err.message}`))
      } else {
        db.remove({ _id: clientId }, {}, (err) => {
          if (err) {
            reject(new Error(`Failed to delete client: ${err.message}`))
          } else {
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
