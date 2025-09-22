// Shared date utilities for Arabic PDF handlers
// Provides stable (non-reversing) rendering of dates inside RTL contexts.

/**
 * Convert YYYY-MM-DD to DD-MM-YYYY. Returns empty string if invalid.
 */
export function formatDateForArabic(dateString) {
  if (!dateString || typeof dateString !== 'string') return ''
  const parts = dateString.split('-')
  if (parts.length !== 3) return ''
  const [year, month, day] = parts
  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
}

/**
 * Draw date (already formatted DD-MM-YYYY) left-to-right by drawing each character individually.
 * targetRightX: the right edge where the date should visually end (since rest of line is RTL aligned).
 */
export function drawDateLTR(page, dateStr, targetRightX, y, font, size, color) {
  if (!dateStr) return
  const totalWidth = font.widthOfTextAtSize(dateStr, size)
  const startX = targetRightX - totalWidth
  let cursorX = startX
  for (const ch of dateStr) {
    const w = font.widthOfTextAtSize(ch, size)
    page.drawText(ch, { x: cursorX, y, size, font, color })
    cursorX += w
  }
}
