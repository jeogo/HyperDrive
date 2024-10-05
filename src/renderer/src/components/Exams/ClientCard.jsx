// ClientCard.jsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faBirthdayCake,
  faIdCard,
  faCalendarAlt,
  faPen,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

const ClientCard = ({ client, isSelected, onSelect, onEdit, selectionMode, calculateAge }) => {
  const { trafficLawTest, manoeuvresTest, drivingTest } = client.tests
  const age = calculateAge(client.birth_date)

  return (
    <div dir="rtl" className="w-full rounded-3xl bg-white shadow-lg p-6 flex items-center relative">
      <button
        onClick={() => onEdit(client)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
        title="تعديل"
      >
        <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
      </button>

      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(client)}
          className="ml-4 h-5 w-5 text-blue-600"
        />
      )}

      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClientDetails client={client} calculateAge={calculateAge} />
          <TestResult test={trafficLawTest} label="اختبار قانون المرور" />
          <TestResult test={manoeuvresTest} label="اختبار المناورات" />
          <TestResult test={drivingTest} label="اختبار القيادة" disabled={age < 19} />
        </div>
      </div>
    </div>
  )
}

const ClientDetails = ({ client, calculateAge }) => (
  <>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faUser} className="text-indigo-500 h-6 w-6 ml-2" />
      <span className="font-semibold text-xl text-gray-800">
        {client?.first_name_ar} {client?.last_name_ar}
      </span>
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
  </>
)

const TestResult = ({ test, label, disabled }) => (
  <div className={`flex items-center ${disabled ? 'opacity-50' : ''}`}>
    <FontAwesomeIcon
      icon={test.passed ? faCheckCircle : faTimesCircle}
      className={`${test.passed ? 'text-green-500' : 'text-red-500'} h-6 w-6 ml-2`}
    />
    <span className="text-lg text-gray-600">
      {test.passed ? `اجتاز ${label}` : `لم يجتز ${label}`}
    </span>
    <span className="ml-2 text-sm text-gray-500">
      (المحاولات: {test.attempts},{' '}
      {test.lastAttemptDate ? `آخر محاولة: ${test.lastAttemptDate}` : 'لا توجد محاولة'})
    </span>
  </div>
)

export default ClientCard
