// Shared PDF utilities for Arabic PDF handlers
// This module contains common functions used across all PDF handlers to eliminate code duplication

import fs from 'fs'
import path from 'path'
import { degrees } from 'pdf-lib'

/**
 * Load the Amiri font for Arabic text rendering
 * @returns {Promise<Buffer|null>} Font bytes or null if font not found
 */
export const loadFont = async (weight = 'regular') => {
  // Try bold first if requested
  const candidates = []
  if (weight === 'bold') {
    candidates.push('Amiri-Bold.ttf')
  }
  candidates.push('Amiri-Regular.ttf')

  for (const file of candidates) {
    const fontPath = path.join(__dirname, '../fonts', file)
    if (fs.existsSync(fontPath)) {
      return fs.readFileSync(fontPath)
    }
  }
  console.log(
    '[WARN] Amiri font files not found (Bold/Regular). Will rely on PDF built-in fallback.'
  )
  return null
}

/**
 * Draw Arabic text with correct RTL support and enhanced bold rendering
 * @param {PDFPage} page - The PDF page to draw on
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {PDFFont} font - Font to use
 * @param {number} size - Font size
 * @param {RGB} color - Text color
 * @param {number} rotate - Rotation angle in degrees (optional)
 * @param {boolean} simulateBold - Whether to simulate bold text (optional)
 */
export function drawTextWithArabicSupport(
  page,
  text,
  x,
  y,
  font,
  size,
  color,
  rotate = 0,
  simulateBold = true // Changed default to true for bold text
) {
  if (!font) {
    // Without a custom font we can't measure width accurately; draw as-is
    const fallbackOptions = { x, y, size, color }
    if (rotate) fallbackOptions.rotate = degrees(rotate)
    page.drawText(text, fallbackOptions)
    return
  }

  const textWidth = font.widthOfTextAtSize(text, size)
  const adjustedX = x - textWidth
  const baseOptions = { x: adjustedX, y, size, font, color }
  if (rotate) baseOptions.rotate = degrees(rotate)

  if (!simulateBold) {
    page.drawText(text, baseOptions)
  } else {
    // Enhanced bold simulation with better offsets for cleaner appearance
    const offsets = [
      [0, 0], // Original position
      [0.3, 0], // Right offset
      [0, 0.3], // Up offset
      [0.3, 0.3], // Diagonal offset
      [0.6, 0], // Additional right for extra boldness
      [0, 0.6] // Additional up for extra boldness
    ]

    offsets.forEach(([dx, dy]) => {
      page.drawText(text, {
        ...baseOptions,
        x: baseOptions.x + dx,
        y: baseOptions.y + dy
      })
    })
  }
}

/**
 * Draw text with extra bold effect (for titles and important text)
 * @param {PDFPage} page - The PDF page to draw on
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {PDFFont} font - Font to use
 * @param {number} size - Font size
 * @param {RGB} color - Text color
 * @param {number} rotate - Rotation angle in degrees (optional)
 */
export function drawBoldText(page, text, x, y, font, size, color, rotate = 0) {
  if (!font) {
    const fallbackOptions = { x, y, size: size + 1, color } // Slightly larger for fallback
    if (rotate) fallbackOptions.rotate = degrees(rotate)
    page.drawText(text, fallbackOptions)
    return
  }

  const textWidth = font.widthOfTextAtSize(text, size)
  const adjustedX = x - textWidth
  const baseOptions = { x: adjustedX, y, size, font, color }
  if (rotate) baseOptions.rotate = degrees(rotate)

  // Extra bold simulation with more layers
  const boldOffsets = [
    [0, 0],
    [0.2, 0],
    [0.4, 0],
    [0.6, 0],
    [0, 0.2],
    [0.2, 0.2],
    [0.4, 0.2],
    [0.6, 0.2],
    [0, 0.4],
    [0.2, 0.4],
    [0.4, 0.4],
    [0.6, 0.4]
  ]

  boldOffsets.forEach(([dx, dy]) => {
    page.drawText(text, {
      ...baseOptions,
      x: baseOptions.x + dx,
      y: baseOptions.y + dy
    })
  })
}

/**
 * Reverse numbers in the string (useful for Arabic formatting)
 * @param {string} str - String containing numbers to reverse
 * @returns {string} String with reversed numbers
 */
export function reverseNumbersInString(str) {
  return String(str).replace(/\d+/g, (match) => match.split('').reverse().join(''))
}

/**
 * Ensure output directory exists for PDF generation
 * @param {string} dirPath - Directory path to create
 */
export function ensureOutputDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Get template path and validate existence
 * @param {string} templateName - Name of the template file
 * @returns {string} Full path to template
 * @throws {Error} If template doesn't exist
 */
export function getTemplatePath(templateName) {
  const templatePath = path.join(__dirname, '../templates', templateName)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at path: ${templatePath}`)
  }
  return templatePath
}

/**
 * Create a safe folder name from Arabic text
 * @param {string} name - Name to sanitize
 * @returns {string} Safe folder name
 */
export function sanitizeArabicFolderName(name) {
  if (!name || typeof name !== 'string') return 'unknown'

  // Convert to ASCII-safe representation for Windows file system
  return (
    name
      .trim()
      .replace(/[<>:"/\\|?*]/g, '') // Remove Windows invalid chars
      .replace(/[\\x00-\\x1F]/g, '') // Remove control chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(
        /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9_-]/g,
        ''
      ) // Keep only Arabic, Latin, numbers, underscore, dash
      .substring(0, 30) || 'client' // Limit length with fallback
  )
}

/**
 * Generate a safe client directory path with Unicode handling
 * @param {Object} clientData - Client data object
 * @returns {string} Safe directory path
 */
export function generateSafeClientPath(clientData) {
  const { app } = require('electron')

  // Use Arabic names if available, fallback to Latin names
  const firstName = clientData.first_name_ar || clientData.first_name || 'client'
  const lastName = clientData.last_name_ar || clientData.last_name_ar || 'unknown'

  const safeFirstName = sanitizeArabicFolderName(firstName)
  const safeLastName = sanitizeArabicFolderName(lastName)
  const timestamp = Date.now().toString().slice(-6)

  const folderName = `${safeFirstName}_${safeLastName}_${timestamp}`
  const basePath = path.join(app.getPath('userData'), 'PDFs', 'Clients')

  return path.join(basePath, folderName)
}

/**
 * Ensure client directory exists with proper Unicode handling
 * @param {Object} clientData - Client data object
 * @returns {string} Safe directory path that exists
 */
export function ensureClientDirectory(clientData) {
  let clientPath = clientData.path

  // If path doesn't exist or is invalid, generate a new safe path
  if (!clientPath || !fs.existsSync(clientPath)) {
    clientPath = generateSafeClientPath(clientData)
  }

  // Ensure the directory exists
  try {
    if (!fs.existsSync(clientPath)) {
      fs.mkdirSync(clientPath, { recursive: true })
    }
    return clientPath
  } catch (error) {
    // If we still have issues, fall back to a very safe path
    const { app } = require('electron')
    const safeFallbackPath = path.join(
      app.getPath('userData'),
      'PDFs',
      'Clients',
      `client_${Date.now()}`
    )
    fs.mkdirSync(safeFallbackPath, { recursive: true })
    return safeFallbackPath
  }
}
