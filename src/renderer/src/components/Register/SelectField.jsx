// SelectField.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SelectField = ({
  name,
  value,
  onChange,
  options,
  icon,
  iconColor,
  placeholder,
  label,
  required = false,
  helpText
}) => {
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300 text-gray-800 appearance-none"
          required={required}
        >
          <option value="" className="text-gray-400">
            {placeholder}
          </option>
          {options.map((option, idx) => (
            <option key={idx} value={option.value} className="text-gray-800">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  )
}

export default SelectField
