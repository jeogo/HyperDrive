// ClientCard.jsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarAlt,
  faUser,
  faCalendarCheck,
  faCheckCircle,
  faTimesCircle,
  faIdCard
} from '@fortawesome/free-solid-svg-icons'

const ClientCard = ({ client, isSelected, onSelect, showCheckbox, printed }) => {
  // Calculate age based on birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'غير متوفر'
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDifference = today.getMonth() - birth.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

  const age = calculateAge(client?.birth_date)

  // Age color helper
  const getAgeColor = (age) => {
    if (age < 18) return 'bg-red-500'
    if (age === 18) return 'bg-yellow-500'
    if (age > 18) return 'bg-green-500'
    return 'bg-gray-500'
  }

  // Printed status
  const printedStatusIcon = printed ? faCheckCircle : faTimesCircle
  const printedStatusColor = printed ? 'text-green-500' : 'text-red-500'
  const printedStatusText = printed ? 'تمت الطباعة' : 'لم يتم الطباعة'

  return (
    <div
      dir="rtl"
      className={`w-full rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-4 flex items-center ${
        isSelected ? 'border-4 border-blue-500' : ''
      }`}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(client)}
          className="ml-4 h-5 w-5 text-blue-600"
        />
      )}

      <div className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Name */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="text-indigo-500 h-6 w-6 ml-2" />
            <span className="font-semibold text-lg text-gray-800">
              {client?.first_name_ar} {client?.last_name_ar}
            </span>
          </div>

          {/* National ID */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faIdCard} className="text-yellow-500 h-6 w-6 ml-2" />
            <span className="text-lg text-gray-600">
              {client?.national_id ? client.national_id : 'غير متوفر'}
            </span>
          </div>

          {/* Birth Date */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-pink-500 h-6 w-6 ml-2" />
            <span className="text-lg text-gray-600">
              {client?.birth_date ? client.birth_date : 'غير متوفر'}
            </span>
          </div>

          {/* Register Date */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500 h-6 w-6 ml-2" />
            <span className="text-lg text-gray-600">
              {client?.register_date ? client.register_date : 'غير متوفر'}
            </span>
          </div>

          {/* Age */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAgeColor(
                age
              )} ml-2`}
            >
              {age}
            </div>
            <span className="text-lg text-gray-600">العمر</span>
          </div>

          {/* Printed Status */}
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={printedStatusIcon}
              className={`${printedStatusColor} h-6 w-6 ml-2`}
            />
            <span className="text-lg text-gray-600">{printedStatusText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCard
