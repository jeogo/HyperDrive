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

// تحديد مسار المجلد الرئيسي للعملاء وملف Clients.json
const baseDir = app.isPackaged
  ? join(process.resourcesPath, 'Clients')
  : join(__dirname, '../Clients')
const clientsFilePath = app.isPackaged
  ? join(process.resourcesPath, 'Clients.json')
  : join(__dirname, '../Clients.json')

// التأكد من وجود المجلد وملف JSON الخاص بالعملاء، وإن لم يكن موجودًا، يتم إنشاؤهما
if (!existsSync(baseDir)) {
  mkdirSync(baseDir, { recursive: true })
}
if (!existsSync(clientsFilePath)) {
  writeFileSync(clientsFilePath, JSON.stringify([]))
}

// دالة لقراءة بيانات العملاء من ملف Clients.json
const readClientsFile = () => {
  try {
    const data = readFileSync(clientsFilePath)
    return JSON.parse(data)
  } catch (error) {
    throw new Error(`Failed to read clients file: ${error.message}`)
  }
}

// دالة لكتابة بيانات العملاء إلى ملف Clients.json
const writeClientsFile = (data) => {
  try {
    writeFileSync(clientsFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    throw new Error(`Failed to write clients file: ${error.message}`)
  }
}

// إنشاء مسار مجلد العميل بناءً على اسمه ولقبه
export const generateClientPath = (firstName, lastName) => {
  try {
    return join(baseDir, `${firstName}_${lastName}`)
  } catch (error) {
    throw new Error(`Failed to generate client path: ${error.message}`)
  }
}

// عمليات CRUD للعملاء (Create, Read, Update, Delete)

// إنشاء عميل جديد
export const createClient = (clientData) => {
  try {
    const clients = readClientsFile()

    // التأكد من عدم وجود العميل بالفعل بناءً على رقم الهوية الوطنية
    if (clients.some((client) => client.national_id === clientData.national_id)) {
      throw new Error(`Client with national_id ${clientData.national_id} already exists.`)
    }

    // إنشاء مجلد جديد للعميل إذا لم يكن موجودًا بالفعل
    const folderPath = generateClientPath(clientData.first_name_ar, clientData.last_name_ar)
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true })
    }

    // تعيين مسار المجلد للعميل وتحديث ملف JSON
    clientData.path = folderPath
    clientData.depositSubmitted = false // إضافة حالة الإيداع الافتراضية
    clientData.tests = {
      lawTest: { passed: false, attempts: 0, lastAttemptDate: null },
      drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
    }

    clients.push(clientData)
    writeClientsFile(clients)

    return clientData
  } catch (error) {
    throw new Error(`Failed to create client: ${error.message}`)
  }
}

// قراءة جميع العملاء
export const readClients = () => {
  try {
    return readClientsFile()
  } catch (error) {
    throw new Error(`Failed to read clients: ${error.message}`)
  }
}

// تحديث بيانات العميل
export const updateClient = (nationalId, updatedData) => {
  try {
    const clients = readClientsFile()
    const index = clients.findIndex((client) => client.national_id === nationalId)

    if (index === -1) {
      throw new Error(`Client with national_id ${nationalId} not found.`)
    }

    clients[index] = { ...clients[index], ...updatedData }
    writeClientsFile(clients)
    return clients[index]
  } catch (error) {
    throw new Error(`Failed to update client: ${error.message}`)
  }
}

// حذف العميل بناءً على رقم الهوية الوطنية
export const deleteClient = (nationalId) => {
  try {
    let clients = readClientsFile()
    const client = clients.find((client) => client.national_id === nationalId)
    if (!client) {
      throw new Error(`Client with national_id ${nationalId} not found.`)
    }

    // إزالة العميل من قائمة العملاء
    clients = clients.filter((client) => client.national_id !== nationalId)
    writeClientsFile(clients)

    // حذف مجلد العميل
    const folderPath = client.path
    if (folderPath && existsSync(folderPath)) {
      rmdirSync(folderPath, { recursive: true })
    }

    return true
  } catch (error) {
    throw new Error(`Failed to delete client: ${error.message}`)
  }
}

// دوال إدارة المجلدات (إنشاء، قراءة، تحديث، حذف)

// إنشاء مجلد جديد
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

// قراءة جميع المجلدات
export const readFolders = () => {
  try {
    return readdirSync(baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    throw new Error(`Failed to read folders: ${error.message}`)
  }
}

// تحديث اسم مجلد
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

// حذف مجلد
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

// فتح المجلد باستخدام متصفح الملفات
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
