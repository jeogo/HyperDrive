import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const InputField = ({
  icon,
  name,
  value,
  placeholder,
  onChange,
  type = 'text',
  pattern,
  min,
  max,
  maxLength,
  iconColor,
  label,
  required = false,
  helpText
}) => (
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
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300 text-gray-800 placeholder-gray-400"
        pattern={pattern}
        min={min}
        max={max}
        maxLength={maxLength}
        required={required}
      />
    </div>
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
)

export default InputField
