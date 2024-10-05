import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarAlt,
  faUser,
  faCalendarCheck,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

const ClientCard = ({ client, isSelected, onSelect, showCheckbox }) => {
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
    if (age >= 19) return 'bg-green-500'
    return 'bg-gray-500'
  }

  // Deposit status
  const depositSubmitted = client.depositSubmitted || false
  const depositStatusIcon = depositSubmitted ? faCheckCircle : faTimesCircle
  const depositStatusColor = depositSubmitted ? 'text-green-500' : 'text-red-500'
  const depositStatusText = depositSubmitted
    ? 'مضاف إلى حافظة الإيداع'
    : 'غير مضاف إلى حافظة الإيداع'

  return (
    <div
      dir="rtl"
      className="w-full rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 mb-6 flex items-center"
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
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="text-indigo-500 h-6 w-6 ml-2" />
            <span className="font-semibold text-lg text-gray-800">
              {client?.first_name_ar} {client?.last_name_ar}
            </span>
          </div>

          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-pink-500 h-6 w-6 ml-2" />
            <span className="text-lg text-gray-600">
              {client?.birth_date ? client.birth_date : 'غير متوفر'}
            </span>
          </div>

          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500 h-6 w-6 ml-2" />
            <span className="text-lg text-gray-600">
              {client?.register_date ? client.register_date : 'غير متوفر'}
            </span>
          </div>

          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAgeColor(age)} ml-2`}
            >
              {age}
            </div>
            <span className="text-lg text-gray-600">العمر</span>
          </div>

          <div className="flex items-center">
            <FontAwesomeIcon
              icon={depositStatusIcon}
              className={`${depositStatusColor} h-6 w-6 ml-2`}
            />
            <span className="text-lg text-gray-600">{depositStatusText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCard
