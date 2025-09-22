// ArchiveClientCard.jsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faBirthdayCake,
  faIdCard,
  faCalendarAlt,
  faUndo,
  faPhoneAlt,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons'
import { calculateAge } from '../../utils/clientUtils'

const ArchiveClientCard = ({ client, onUnarchiveClient }) => {
  return (
    <div dir="rtl" className="w-full rounded-3xl bg-white shadow-lg p-6 flex items-center relative">
      {/* Unarchive button */}
      <button
        onClick={() => onUnarchiveClient(client)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
        title="إلغاء الأرشفة"
      >
        <FontAwesomeIcon icon={faUndo} className="h-5 w-5" />
      </button>

      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClientDetails client={client} />
        </div>
      </div>
    </div>
  )
}

const ClientDetails = ({ client }) => (
  <>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faUser} className="text-indigo-500 h-6 w-6 ml-2" />
      <span className="font-semibold text-xl text-gray-800">
        {client?.first_name_ar} {client?.last_name_ar}
      </span>
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faPhoneAlt} className="text-green-500 h-6 w-6 ml-2" />
      <span className="text-lg text-gray-600">{`رقم الهاتف: ${client.phone_number}`}</span>
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faBirthdayCake} className="text-yellow-500 h-6 w-6 ml-2" />
      <span className="text-lg text-gray-600">{`العمر: ${calculateAge(client.birth_date)}`}</span>
    </div>
    {client.register_number && (
      <div className="flex items-center">
        <FontAwesomeIcon icon={faIdCard} className="text-blue-500 h-6 w-6 ml-2" />
        <span className="text-lg text-gray-600">{`رقم التسجيل: ${client.register_number}`}</span>
      </div>
    )}
    <div className="flex items-center">
      <FontAwesomeIcon icon={faCalendarAlt} className="text-pink-500 h-6 w-6 ml-2" />
      <span className="text-lg text-gray-600">
        {client?.birth_date ? `تاريخ الميلاد: ${client.birth_date}` : 'تاريخ الميلاد غير متوفر'}
      </span>
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faCalendarCheck} className="text-purple-500 h-6 w-6 ml-2" />
      <span className="text-lg text-gray-600">
        {client?.register_date
          ? `تاريخ التسجيل: ${client.register_date}`
          : 'تاريخ التسجيل غير متوفر'}
      </span>
    </div>
  </>
)

export default ArchiveClientCard
