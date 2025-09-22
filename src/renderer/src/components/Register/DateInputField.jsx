import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// DateInputField: displays and edits date in DD/MM/YYYY while emitting ISO (YYYY-MM-DD) via onChange
const DateInputField = ({
  icon,
  name,
  value, // expected ISO (YYYY-MM-DD) or ''
  onChange, // (syntheticEventLike) -> parent handleChange
  label,
  placeholder = 'DD/MM/YYYY',
  iconColor = 'text-blue-500',
  required = false,
  min, // ISO min
  max, // ISO max
  helpText
}) => {
  const toDisplay = (iso) => {
    if (!iso) return ''
    // Accept also already dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    const m2 = iso.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
    if (m2) return `${m2[3]}/${m2[2]}/${m2[1]}`
    return iso
  }
  const toISO = (display) => {
    if (!display) return ''
    const m = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (m) {
      const [, dd, mm, yyyy] = m // eslint-disable-line no-unused-vars
      return `${yyyy}-${mm}-${dd}`
    }
    // try native parse fallback
    const d = new Date(display)
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10)
    }
    return ''
  }

  const [displayValue, setDisplayValue] = useState(toDisplay(value))
  const [error, setError] = useState('')

  useEffect(() => {
    setDisplayValue(toDisplay(value))
  }, [value])

  const validate = (val) => {
    if (!val) {
      if (required) return 'هذا الحقل مطلوب'
      return ''
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return 'التنسيق يجب أن يكون DD/MM/YYYY'
    const [dd, mm, yyyy] = val.split('/')
    const day = parseInt(dd, 10)
    const month = parseInt(mm, 10)
    // Year parsed for completeness (range checks could be added later)
    // const year = parseInt(yyyy, 10)
    if (month < 1 || month > 12) return 'شهر غير صحيح'
    if (day < 1 || day > 31) return 'يوم غير صحيح'
    const composed = `${yyyy}-${mm}-${dd}`
    if (min && composed < min) return 'التاريخ أصغر من المسموح'
    if (max && composed > max) return 'التاريخ أكبر من المسموح'
    return ''
  }

  const autoFormat = (raw) => {
    // Keep only digits
    let digits = raw.replace(/[^0-9]/g, '')
    if (digits.length > 8) digits = digits.slice(0, 8)
    const parts = []
    if (digits.length <= 2) {
      parts.push(digits)
    } else if (digits.length <= 4) {
      parts.push(digits.slice(0, 2), digits.slice(2))
    } else {
      parts.push(digits.slice(0, 2), digits.slice(2, 4), digits.slice(4))
    }
    return parts.filter(Boolean).join('/')
  }

  const handleInputChange = (e) => {
    const raw = e.target.value
    const formatted = autoFormat(raw)
    setDisplayValue(formatted)
    const err = validate(formatted)
    setError(err)
    if (!err && /^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
      const iso = toISO(formatted)
      onChange({ target: { name, value: iso, type: 'text' } })
    } else if (!formatted) {
      onChange({ target: { name, value: '', type: 'text' } })
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
          <FontAwesomeIcon icon={icon} className={`${iconColor} text-lg`} />
        </div>
        <input
          id={name}
          name={name}
          type="text"
          // Pattern for DD/MM/YYYY
          pattern="^\d{2}\/\d{2}\/\d{4}$"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          className={`w-full pr-12 pl-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white hover:border-gray-300 text-gray-800 placeholder-gray-400 ${error ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
          required={required}
          inputMode="numeric"
          autoComplete="off"
        />
      </div>
      {helpText && !error && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default DateInputField
