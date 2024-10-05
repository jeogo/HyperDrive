import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  PencilIcon,
  EyeIcon,
  PrinterIcon,
  IdentificationIcon,
} from '@heroicons/react/outline'

// Function to calculate the client's age based on their birth date
const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Function to get the color based on the age
const getAgeColor = (age) => {
  if (age >= 19) {
    return 'bg-green-500' // Green for ages 19 or above
  } else if (age === 18) {
    return 'bg-yellow-500' // Yellow for age 18
  } else {
    return 'bg-red-500' // Red for ages below 18
  }
}

const ClientCard = ({ client, onAction, onSelectClient, isSelected }) => {
  const age = calculateAge(client?.birth_date)

  return (
    <div
      dir="rtl"
      className="w-full rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectClient(client)}
                className="mr-2"
              />
              <UserIcon className="text-indigo-500 h-6 w-6 ml-2" />
              <span className="font-semibold text-lg text-gray-800">
                {client?.first_name_ar} {client?.last_name_ar}
              </span>
            </div>

            <div className="flex items-center">
              <PhoneIcon className="text-green-500 h-6 w-6 ml-2" />
              <span className="text-lg text-gray-600">{client?.phone_number}</span>
            </div>

            <div className="flex items-center">
              <IdentificationIcon className="text-blue-500 h-6 w-6 ml-2" />
              <span className="text-lg text-gray-600">
                {client?.national_id ? client?.national_id : 'غير متوفر'}
              </span>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="text-yellow-500 h-6 w-6 ml-2" />
              <span className="text-lg text-gray-600">
                {client?.register_date ? client?.register_date : 'غير متوفر'}
              </span>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="text-pink-500 h-6 w-6 ml-2" />
              <span className="text-lg text-gray-600">
                {client?.birth_date ? client?.birth_date : 'غير متوفر'}
              </span>
            </div>

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
          </div>
        </div>

        <div className="mt-4 lg:mt-0 flex justify-end gap-2 lg:gap-3">
          <button
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-full transition duration-300"
            onClick={() => onAction(client, 'edit')}
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-full transition duration-300"
            onClick={() => onAction(client, 'view')}
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          <button
            className="bg-yellow-600 text-white hover:bg-yellow-700 px-3 py-2 rounded-full transition duration-300"
            onClick={() => onAction(client, 'print')}
          >
            <PrinterIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientCard
