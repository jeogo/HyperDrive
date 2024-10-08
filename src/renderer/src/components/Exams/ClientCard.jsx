// ClientCard.jsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faBirthdayCake,
  faIdCard,
  faCalendarAlt,
  faPen,
  faCheckCircle,
  faTimesCircle,
  faArchive // Import archive icon
} from '@fortawesome/free-solid-svg-icons'

const ClientCard = ({
  client,
  isSelected,
  onSelect,
  onEdit,
  onArchiveClient, // Add this prop to handle archiving
  selectionMode,
  calculateAge
}) => {
  // Destructure test results for easier access
  const { trafficLawTest, manoeuvresTest, drivingTest } = client.tests
  const age = calculateAge(client.birth_date)

  // Determine if the client has passed all tests
  const hasPassedAllTests = trafficLawTest.passed && manoeuvresTest.passed && drivingTest.passed

  // Determine if the client has paid all dues
  const hasPaidAllDues = client.paid >= client.subPrice

  return (
    <div
      dir="rtl"
      className="w-full rounded-3xl bg-white shadow-lg p-6 flex flex-col sm:flex-row items-center relative"
    >
      {/* Edit Button */}
      <button
        onClick={() => onEdit(client)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
        title="تعديل"
      >
        <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
      </button>

      {/* Checkbox for selection mode */}
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(client)}
          className="ml-4 h-5 w-5 text-blue-600"
        />
      )}

      {/* Client Details */}
      <div className="flex-grow w-full sm:w-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClientDetails client={client} calculateAge={calculateAge} />
          <TestResult test={trafficLawTest} label="اختبار قانون المرور" />
          <TestResult test={manoeuvresTest} label="اختبار المناورات" />
          {/* Driving Test should only be enabled if the client is 18 or older */}
          <TestResult
            test={drivingTest}
            label="اختبار القيادة"
            disabled={age < 18} // Disabled for clients under 18
          />
        </div>
      </div>

      {/* Add to Archive Button */}
      {hasPassedAllTests && hasPaidAllDues && (
        <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
          <button
            onClick={() => onArchiveClient(client)}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 flex items-center justify-center w-full"
          >
            <FontAwesomeIcon icon={faArchive} className="h-5 w-5 ml-2" />
            <span>أضف إلى الأرشيف</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Component to display basic client details (name, age, register number, etc.)
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
    {/* Display the amount paid and the amount due */}
    <div className="flex items-center">
      <span className="text-lg text-gray-600">{`المبلغ المدفوع: ${client.paid} DA`}</span>
    </div>
    <div className="flex items-center">
      <span className="text-lg text-gray-600">{`المبلغ المستحق: ${client.subPrice} DA`}</span>
    </div>
  </>
)

// Component to display the test result (passed, attempts, last attempt date)
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
