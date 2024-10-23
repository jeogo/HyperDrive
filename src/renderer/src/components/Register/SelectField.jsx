// SelectField.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SelectField = ({
  icon,
  name,
  value,
  placeholder,
  onChange,
  options,
  iconColor,
}) => (
  <div className="flex-1">
    <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <FontAwesomeIcon icon={icon} className={`${iconColor} text-2xl ml-3`} />
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default SelectField;
