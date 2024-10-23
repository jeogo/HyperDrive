// InputField.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
}) => (
  <div className="flex-1">
    <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <FontAwesomeIcon icon={icon} className={`${iconColor} text-2xl ml-3`} />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        pattern={pattern}
        min={min}
        max={max}
        maxLength={maxLength}
      />
    </div>
  </div>
);

export default InputField;
