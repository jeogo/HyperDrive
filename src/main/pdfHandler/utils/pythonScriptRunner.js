import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

/**
 * Execute a python script and collect stdout/stderr.
 * Returns { code, stdout, stderr }.
 */
export function runPython(scriptPath, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const pyExecutable = options.pythonPath || 'python'

    // Handle JSON arguments by writing them to temporary files
    const processedArgs = []
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      // Check if this is a --client-data argument followed by JSON
      if (arg === '--client-data' && i + 1 < args.length) {
        const jsonData = args[i + 1]
        try {
          // Validate it's JSON
          JSON.parse(jsonData)

          // Write to temporary file
          const tempFile = path.join(os.tmpdir(), `client-data-${Date.now()}.json`)
          fs.writeFileSync(tempFile, jsonData, 'utf8')

          // Replace with --data argument pointing to temp file
          processedArgs.push('--data', tempFile)
          i++ // Skip the next argument as we've processed it
        } catch (e) {
          // If not valid JSON, keep original arguments
          processedArgs.push(arg)
        }
      } else {
        processedArgs.push(arg)
      }
    }

    const proc = spawn(pyExecutable, [scriptPath, ...processedArgs], {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        PYTHONUTF8: '1', // Force UTF-8 mode where supported
        PYTHONIOENCODING: 'utf-8',
        ...options.env
      }
    })

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => (stdout += d.toString()))
    proc.stderr.on('data', (d) => (stderr += d.toString()))

    proc.on('error', (err) => reject(err))
    proc.on('close', (code) => {
      // Clean up temp files
      for (let i = 0; i < processedArgs.length; i++) {
        if (processedArgs[i] === '--data' && i + 1 < processedArgs.length) {
          const tempFile = processedArgs[i + 1]
          if (tempFile.includes('client-data-') && fs.existsSync(tempFile)) {
            try {
              fs.unlinkSync(tempFile)
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        }
      }

      resolve({ code, stdout, stderr })
    })
  })
}

/**
 * High-level helper specifically for scripts that may output a line like:
 *   PDF_PATH=absolute_path_to_file.pdf
 * Returns the detected pdfPath or null.
 */
export async function runPythonForPDF(scriptPath, args = [], options = {}) {
  const result = await runPython(scriptPath, args, options)
  let pdfPath = null
  const match = result.stdout.match(/PDF_PATH=([^\r\n]+)/)
  if (match) {
    pdfPath = match[1].trim()
  }
  return { ...result, pdfPath }
}

/**
 * Utility to build output path in userData safe directory (Electron main only).
 */
export function buildUserDataOutput(app, segments = []) {
  const base = app.getPath('userData')
  return path.join(base, ...segments)
}
