import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { app } from 'electron'
import path from 'path'

// Load environment variables from .env file
dotenv.config({
  path: app.isPackaged
    ? path.join(process.resourcesPath, '../../.env')
    : path.join(__dirname, '../.env')
})

// MongoDB connection URL and Database Name
const MONGODB_URL =
  process.env.MONGODB_URL ||
  'mongodb+srv://admin:admin@dcs.2udsw.mongodb.net/?retryWrites=true&w=majority&appName=DCS'
const DATABASE_NAME = process.env.DATABASE_NAME || 'test'

let client
let db

// Connect to MongoDB function
export const connectToDatabase = async () => {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      await client.connect()
      db = client.db(DATABASE_NAME)
      console.log('Connected to MongoDB')
    }
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw new Error('Database connection failed')
  }
}

// Close MongoDB connection
export const closeDatabaseConnection = async () => {
  try {
    if (client) {
      await client.close()
      console.log('MongoDB connection closed')
    }
  } catch (error) {
    console.error('Failed to close MongoDB connection:', error)
  }
}
