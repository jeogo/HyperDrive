import { ipcMain, shell, app } from 'electron'
import { spawn } from 'child_process'
import path from 'path'
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
  generateClientPath,
  addPayment, // New payment handling
  recordExamAttempt, // New exam handling
  recordSubmission, // New submission handling
  archiveClient, // New archival handling
  searchClients, // New search functionality
  getClientById, // New get by ID functionality
  getClientsPaginated, // FAST pagination
  invalidateCache // FAST cache management
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

  ipcMain.handle('update-client', async (event, clientId, updatedData, editedFields = []) => {
    try {
      const updatedClient = await updateClient(clientId, updatedData, editedFields)
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

  // Search clients
  ipcMain.handle('search-clients', async (event, query) => {
    try {
      const results = await searchClients(query)
      return results
    } catch (error) {
      console.error('Failed to search clients:', error)
      throw new Error(`Failed to search clients: ${error.message}`)
    }
  })

  // Get client by ID
  ipcMain.handle('get-client-by-id', async (event, clientId) => {
    try {
      const client = await getClientById(clientId)
      return client
    } catch (error) {
      console.error('Failed to get client:', error)
      throw new Error(`Failed to get client: ${error.message}`)
    }
  })

  // FAST OPERATIONS - Performance Optimized Handlers

  // Get paginated clients with filters - FAST
  ipcMain.handle('get-clients-paginated', async (event, page, limit, filters) => {
    try {
      const result = await getClientsPaginated(page, limit, filters)
      return result
    } catch (error) {
      console.error('Failed to get paginated clients:', error)
      throw new Error(`Failed to get paginated clients: ${error.message}`)
    }
  })

  // Invalidate cache for fresh data
  ipcMain.handle('invalidate-cache', async () => {
    try {
      invalidateCache()
      return { success: true }
    } catch (error) {
      console.error('Failed to invalidate cache:', error)
      throw new Error(`Failed to invalidate cache: ${error.message}`)
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

  // Payment history handler
  ipcMain.handle('add-payment', async (event, clientId, amount) => {
    try {
      const result = await addPayment(clientId, amount)
      return result
    } catch (error) {
      console.error('Failed to add payment:', error)
      throw new Error(`Failed to add payment: ${error.message}`)
    }
  })

  // Record exam attempt handler
  ipcMain.handle('record-exam-attempt', async (event, clientId, examType, passed) => {
    try {
      const result = await recordExamAttempt(clientId, examType, passed)
      return result
    } catch (error) {
      console.error('Failed to record exam attempt:', error)
      throw new Error(`Failed to record exam attempt: ${error.message}`)
    }
  })

  // Record submission handler
  ipcMain.handle('record-submission', async (event, clientId, submissionDetails) => {
    try {
      const result = await recordSubmission(clientId, submissionDetails)
      return result
    } catch (error) {
      console.error('Failed to record submission:', error)
      throw new Error(`Failed to record submission: ${error.message}`)
    }
  })

  // Get submission history for a client
  ipcMain.handle('get-submission-history', async (event, clientId) => {
    try {
      const client = await getClientById(clientId)
      return client ? client.submissionHistory || [] : []
    } catch (error) {
      console.error('Failed to get submission history:', error)
      throw new Error(`Failed to get submission history: ${error.message}`)
    }
  })

  // Archive/unarchive client handler
  ipcMain.handle('archive-client', async (event, clientId, action) => {
    try {
      const result = await archiveClient(clientId, action)
      return result
    } catch (error) {
      console.error(`Failed to ${action} client:`, error)
      throw new Error(`Failed to ${action} client: ${error.message}`)
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

  // Handler: generate Word document (Deposit) via Python script
  ipcMain.handle('generate-deposit-docx', async (event, options = {}) => {
    const {
      template = 'resources/templates/ملف الإيداع.docx',
      output = 'output/ملف الإيداع.docx',
      jsonPath = null,
      candidates = null, // قائمة مرشحين مباشرة من الواجهة
      width = 70,
      mode = 'flat',
      pythonPath = 'python',
      pdf = false,
      pdfOnly = false,
      cache = true // تفعيل التخطي الافتراضي لو نفس المدخلات
    } = options

    return await new Promise((resolve, reject) => {
      try {
        const cwd = process.cwd()
        const scriptPath = path.join(cwd, 'scripts', 'generate_deposit_docx.py')

        // حل مسار القالب (إذا كان نسبياً)
        const resolvedTemplate = path.isAbsolute(template) ? template : path.join(cwd, template)

        // الإخراج: احفظ دائماً داخل userData للحفاظ على صلاحيات الكتابة عند التوزيع
        const userDataDir = app.getPath('userData')
        const outputRelative = output.replace(/^output[\\/]/i, '') // إزالة prefix قياسي إن وجد
        const resolvedOutput = path.isAbsolute(output)
          ? output
          : path.join(userDataDir, 'deposit-docx', outputRelative)

        // إذا وُجدت قائمة مرشحين ونفعل cache غيّر اسم الإخراج ليحمل hash
        let finalOutput = resolvedOutput
        if (Array.isArray(candidates) && candidates.length > 0 && cache) {
          try {
            const hash = require('crypto')
              .createHash('md5')
              .update(
                JSON.stringify(
                  candidates.map((c) => ({
                    f: c.first_name_ar || c.first_name || '',
                    l: c.last_name_ar || c.last_name || ''
                  }))
                ) + `|${mode}|${width}|${pdfOnly ? 'pdfOnly' : ''}|${pdf ? 'pdf' : ''}`
              )
              .digest('hex')
              .slice(0, 10)
            const ext = path.extname(resolvedOutput) || '.docx'
            const baseName = path.basename(resolvedOutput, ext)
            const dirName = path.dirname(resolvedOutput)
            finalOutput = path.join(dirName, `${baseName}-${hash}${ext}`)
          } catch (e) {
            // في حال فشل التجزئة تجاهل واستخدم الاسم الأصلي
          }
        }

        const args = [
          scriptPath,
          '--template',
          resolvedTemplate,
          '--output',
          finalOutput,
          '--width',
          String(width),
          '--mode',
          mode
        ]
        if (pdfOnly) {
          args.push('--pdf-only')
        } else if (pdf) {
          args.push('--pdf')
        }
        if (cache) {
          args.push('--skip-if-exists')
        }

        if (jsonPath) {
          const resolvedJson = path.isAbsolute(jsonPath) ? jsonPath : path.join(cwd, jsonPath)
          args.push('--json', resolvedJson)
        } else if (Array.isArray(candidates) && candidates.length > 0) {
          try {
            const tempDir = path.join(app.getPath('userData'), 'deposit-docx', 'tmp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
            const tempJsonPath = path.join(
              tempDir,
              `candidates-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
            )
            // نحول الشكل إلى ما يفهمه السكربت: first_name / last_name
            const normalized = candidates.map((c) => ({
              first_name: c.first_name_ar || c.first_name || '',
              last_name: c.last_name_ar || c.last_name || ''
            }))
            fs.writeFileSync(tempJsonPath, JSON.stringify(normalized, null, 2), 'utf-8')
            args.push('--json', tempJsonPath)
          } catch (err) {
            return reject(new Error(`Failed to write temp candidates JSON: ${err.message}`))
          }
        }

        const child = spawn(pythonPath, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.cwd(),
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
          }
        })
        let stdoutData = ''
        let stderrData = ''

        child.stdout.on('data', (d) => {
          stdoutData += d.toString()
        })
        child.stderr.on('data', (d) => {
          stderrData += d.toString()
        })

        child.on('error', (err) => {
          reject(new Error(`Failed to start Python process: ${err.message}`))
        })

        child.on('close', (code) => {
          if (code === 0) {
            // استخراج مسار PDF إن وُجد
            let pdfPath = null
            const pdfMatch = stdoutData.match(/PDF_PATH=([^\r\n]+)/)
            if (pdfMatch && pdfMatch[1].trim()) {
              pdfPath = pdfMatch[1].trim()
            }
            const docxExists = fs.existsSync(finalOutput)
            resolve({
              success: true,
              outputPath: pdfPath || finalOutput,
              docxPath: docxExists ? finalOutput : null,
              pdfPath,
              pdfOnlyRequested: pdfOnly,
              cached: stdoutData.includes('[SKIP]'),
              log: stdoutData.trim()
            })
          } else {
            // Filter out Python warnings from stderr
            const filteredStderr = stderrData
              .split('\n')
              .filter((line) => !line.includes('UserWarning') && !line.includes('pkg_resources'))
              .filter((line) => line.trim().length > 0)
              .join('\n')

            reject(
              new Error(`Python script exited with code ${code}: ${filteredStderr || stdoutData}`)
            )
          }
        })
      } catch (error) {
        reject(new Error(`Failed to run Python script: ${error.message}`))
      }
    })
  })

  // Handler: fill traffic law lessons card
  ipcMain.handle('fill-traffic-law-card', async (event, options = {}) => {
    const {
      input = 'resources/templates/بطاقة خاصة بدروس قانون المرور .docx',
      output = 'output/بطاقة_قانون_المرور_مملوءة.docx',
      startDate, // YYYY-MM-DD (مطلوب)
      data = {}, // كائن يحتوي الحقول
      pythonPath = 'python',
      hasHeader = false,
      sessions = 30,
      pdf = false,
      pdfOnly = false
    } = options

    if (!startDate) {
      throw new Error('startDate مطلوب بصيغة YYYY-MM-DD')
    }

    return await new Promise((resolve, reject) => {
      try {
        const cwd = process.cwd()
        const scriptPath = path.join(cwd, 'scripts', 'fill_traffic_law_lessons_card.py')
        const resolvedInput = path.isAbsolute(input) ? input : path.join(cwd, input)

        // إخراج داخل userData
        const userDataDir = app.getPath('userData')
        const outputRelative = output.replace(/^output[\\/]/i, '')
        const resolvedOutput = path.isAbsolute(output)
          ? output
          : path.join(userDataDir, 'traffic-law-card', outputRelative)

        // كتابة JSON مؤقت للبيانات
        let dataJsonPath = null
        try {
          const tempDir = path.join(userDataDir, 'traffic-law-card', 'tmp')
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
          dataJsonPath = path.join(
            tempDir,
            `data-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
          )
          fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), 'utf-8')
        } catch (e) {
          return reject(new Error(`فشل إنشاء ملف بيانات مؤقت: ${e.message}`))
        }

        const args = [
          scriptPath,
          '--input',
          resolvedInput,
          '--output',
          resolvedOutput,
          '--start-date',
          startDate,
          '--data',
          dataJsonPath,
          '--sessions',
          String(sessions)
        ]
        if (hasHeader) args.push('--has-header')
        if (pdf) args.push('--pdf')
        if (pdfOnly) args.push('--pdf-only')

        const child = spawn(pythonPath, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.cwd(),
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
          }
        })

        let stdoutData = ''
        let stderrData = ''
        child.stdout.on('data', (d) => {
          stdoutData += d.toString()
        })
        child.stderr.on('data', (d) => {
          stderrData += d.toString()
        })
        child.on('error', (err) =>
          reject(new Error(`Failed to start Python process: ${err.message}`))
        )
        child.on('close', (code) => {
          if (code === 0) {
            // استخراج مسار PDF إن وُجد
            let pdfPath = null
            const pdfMatch = stdoutData.match(/PDF_PATH=([^\r\n]+)/)
            if (pdfMatch && pdfMatch[1].trim()) {
              pdfPath = pdfMatch[1].trim()
            }
            const docxExists = fs.existsSync(resolvedOutput)
            resolve({
              success: true,
              outputPath: pdfPath || resolvedOutput,
              docxPath: docxExists ? resolvedOutput : null,
              pdfPath,
              pdfOnlyRequested: pdfOnly,
              log: stdoutData.trim()
            })
          } else {
            reject(new Error(`Python script exited with code ${code}: ${stderrData || stdoutData}`))
          }
        })
      } catch (error) {
        reject(new Error(`Failed to run fill-traffic-law-card script: ${error.message}`))
      }
    })
  })

  // Handler: fill candidate follow-up card
  ipcMain.handle('fill-candidate-follow-up-card', async (event, options = {}) => {
    const {
      input = 'resources/templates/بطاقة المتابعة للمترشح.docx',
      output = 'candidate_follow_up_card.docx',
      startDate, // YYYY-MM-DD (مطلوب)
      clientData = {}, // كائن يحتوي بيانات العميل
      pythonPath = 'python',
      table1Dates = 30,
      table2Dates = 30,
      pdf = false,
      pdfOnly = true // Default to PDF only for candidate follow-up
    } = options

    if (!startDate) {
      throw new Error('startDate مطلوب بصيغة YYYY-MM-DD')
    }

    // INFO: Check traffic law test status for smart processing
    if (clientData._id) {
      try {
        const client = await getClientById(clientData._id)
        if (client && client.tests?.trafficLawTest?.passed) {
          console.log(
            `[INFO] ✅ Client ${client.first_name_ar} ${client.last_name_ar} has passed traffic law test - using smart date calculation`
          )
        } else {
          console.log(
            `[INFO] ⏳ Client has not yet passed traffic law test - generating template card`
          )
        }
      } catch (error) {
        console.warn('Could not verify traffic law test status:', error.message)
      }
    }

    return await new Promise((resolve, reject) => {
      try {
        const cwd = process.cwd()
        const scriptPath = path.join(cwd, 'scripts', 'fill_candidate_follow_up_card.py')
        const resolvedInput = path.isAbsolute(input) ? input : path.join(cwd, input)

        // إخراج داخل userData بنفس نمط traffic law handler - use timestamp for uniqueness
        const userDataDir = app.getPath('userData')
        const outputRelative = output.replace(/^output[\\/]/i, '')
        // Ensure output filename is safe (ASCII only)
        const safeOutputName = outputRelative.replace(/[^\w\-_.]/g, '_')
        const timestampedOutput = safeOutputName.replace(/\.docx$/, `_${Date.now()}.docx`)
        const resolvedOutput = path.isAbsolute(output)
          ? output
          : path.join(userDataDir, 'candidate-follow-up', timestampedOutput)

        // كتابة JSON مؤقت للبيانات (نفس نمط traffic law)
        let dataJsonPath = null
        try {
          const tempDir = path.join(userDataDir, 'candidate-follow-up', 'tmp')
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
          dataJsonPath = path.join(
            tempDir,
            `data-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
          )
          fs.writeFileSync(dataJsonPath, JSON.stringify(clientData, null, 2), 'utf-8')
        } catch (e) {
          return reject(new Error(`فشل إنشاء ملف بيانات مؤقت: ${e.message}`))
        }

        const args = [
          scriptPath,
          '--input',
          resolvedInput,
          '--output',
          resolvedOutput,
          '--start-date',
          startDate,
          '--data',
          dataJsonPath,
          '--table1-dates',
          String(table1Dates),
          '--table2-dates',
          String(table2Dates),
          '--client-id',
          clientData._id || `client_${Date.now()}` // Add unique client ID
        ]

        if (pdf) args.push('--pdf')
        if (pdfOnly) args.push('--pdf-only')

        const child = spawn(pythonPath, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.cwd(),
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
          }
        })

        let stdoutData = ''
        let stderrData = ''
        child.stdout.on('data', (d) => {
          stdoutData += d.toString()
        })
        child.stderr.on('data', (d) => {
          stderrData += d.toString()
        })
        child.on('error', (err) =>
          reject(new Error(`Failed to start Python process: ${err.message}`))
        )
        child.on('close', (code) => {
          // تنظيف ملف البيانات المؤقت
          if (dataJsonPath && fs.existsSync(dataJsonPath)) {
            try {
              fs.unlinkSync(dataJsonPath)
            } catch (e) {
              console.warn(`Warning: Could not delete temp data file: ${e.message}`)
            }
          }

          if (code === 0) {
            // استخراج مسار PDF إن وُجد
            let pdfPath = null
            const pdfMatch = stdoutData.match(/PDF_PATH=([^\r\n]+)/)
            if (pdfMatch && pdfMatch[1].trim()) {
              pdfPath = pdfMatch[1].trim()
            }
            const docxExists = fs.existsSync(resolvedOutput)
            resolve({
              success: true,
              outputPath: pdfPath || resolvedOutput,
              docxPath: docxExists ? resolvedOutput : null,
              pdfPath,
              pdfOnlyRequested: pdfOnly,
              log: stdoutData.trim()
            })
          } else {
            reject(new Error(`Python script exited with code ${code}: ${stderrData || stdoutData}`))
          }
        })
      } catch (error) {
        reject(new Error(`Failed to run fill-candidate-follow-up-card script: ${error.message}`))
      }
    })
  })
}
