// ClientCard.jsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBirthdayCake,
  faIdCard,
  faCalendarAlt,
  faPen,
  faCheckCircle,
  faTimesCircle,
  faArchive,
} from '@fortawesome/free-solid-svg-icons';

const ClientCard = ({
  client,
  isSelected,
  onSelect,
  onEdit,
  onArchiveClient,
  selectionMode,
  calculateAge,
}) => {
  // Destructure test results for easier access
  const { trafficLawTest, manoeuvresTest, drivingTest } = client.tests;
  const age = calculateAge(client.birth_date);

  // Determine if the client has passed all tests
  const hasPassedAllTests =
    trafficLawTest.passed && manoeuvresTest.passed && drivingTest.passed;

  // Determine if the client has paid all dues
  const hasPaidAllDues = client.paid >= client.subPrice;

  return (
    <div
      dir="rtl"
      className={`w-full rounded-3xl bg-white shadow-lg p-6 flex flex-col sm:flex-row items-center relative ${
        isSelected ? 'border-4 border-blue-500' : ''
      }`}
    >
      {/* Checkbox for selection mode */}
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(client)}
          className="ml-4 h-5 w-5 text-blue-600 absolute top-4 right-4"
        />
      )}

      {/* Edit Button */}
      <button
        onClick={() => onEdit(client)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
        title="تعديل"
      >
        <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
      </button>

      {/* Client Details */}
      <div className="flex-grow w-full sm:w-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClientDetails client={client} calculateAge={calculateAge} />

          {/* Test Results */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <TestResult test={trafficLawTest} label="اختبار قانون المرور" />
            <TestResult test={manoeuvresTest} label="اختبار المناورات" />
            {/* Driving Test should only be displayed if the client is 18 or older */}
            {age >= 18 && (
              <TestResult test={drivingTest} label="اختبار القيادة" />
            )}
          </div>
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
  );
};

// Component to display basic client details
const ClientDetails = ({ client, calculateAge }) => (
  <>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faUser} className="text-indigo-500 h-6 w-6 ml-2" />
      <span className="font-semibold text-xl text-gray-800">
        {client.first_name_ar} {client.last_name_ar}
      </span>
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon
        icon={faBirthdayCake}
        className="text-yellow-500 h-6 w-6 ml-2"
      />
      <span className="text-lg text-gray-600">
        العمر: {calculateAge(client.birth_date)}
      </span>
    </div>
    {client.register_number && (
      <div className="flex items-center">
        <FontAwesomeIcon
          icon={faIdCard}
          className="text-blue-500 h-6 w-6 ml-2"
        />
        <span className="text-lg text-gray-600">
          رقم التسجيل: {client.register_number}
        </span>
      </div>
    )}
    <div className="flex items-center">
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className="text-pink-500 h-6 w-6 ml-2"
      />
      <span className="text-lg text-gray-600">
        تاريخ الميلاد: {client.birth_date || 'غير متوفر'}
      </span>
    </div>
    {/* Display the amount paid and the amount due */}
    <div className="flex items-center">
      <span className="text-lg text-gray-600">
        المبلغ المدفوع: {client.paid} د.ج
      </span>
    </div>
    <div className="flex items-center">
      <span className="text-lg text-gray-600">
        المبلغ المستحق: {client.subPrice} د.ج
      </span>
    </div>
  </>
);

// Component to display the test result
const TestResult = ({ test, label }) => (
  <div className="flex items-center mb-2">
    <FontAwesomeIcon
      icon={test.passed ? faCheckCircle : faTimesCircle}
      className={`h-6 w-6 ml-2 ${
        test.passed ? 'text-green-500' : 'text-red-500'
      }`}
    />
    <span className="text-lg text-gray-600">
      {test.passed ? `اجتاز ${label}` : `لم يجتز ${label}`}
    </span>
    <span className="ml-2 text-sm text-gray-500">
      (المحاولات: {test.attempts},{' '}
      {test.lastAttemptDate ? `آخر محاولة: ${test.lastAttemptDate}` : 'لا توجد محاولة'})
    </span>
  </div>
);

export default ClientCard;
