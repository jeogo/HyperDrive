import { memo } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { normalizeTestData } from '../../utils/testUtils'
import {
  faUser,
  faBirthdayCake,
  faIdCard,
  faPhone,
  faPen,
  faCheckCircle,
  faTimesCircle,
  faArchive,
  faClock,
  faGraduationCap,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons'

const ClientCard = memo(function ClientCard({
  client,
  isSelected,
  onSelect,
  onEdit,
  onArchiveClient,
  selectionMode,
  calculateAge
}) {
  // Guard: if client missing
  if (!client) {
    return (
      <div dir="rtl" className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
        لا توجد بيانات للمتدرب
      </div>
    )
  }

  // Safe tests extraction with type conversion using utility function
  const safeTests = client.tests || {}
  const trafficLawTest = normalizeTestData(safeTests.trafficLawTest)
  const manoeuvresTest = normalizeTestData(safeTests.manoeuvresTest)
  const drivingTest = normalizeTestData(safeTests.drivingTest)

  const age = calculateAge(client.birth_date)
  const hasPassedAllTests = !!(trafficLawTest.passed && manoeuvresTest.passed && drivingTest.passed)
  const paid = client.paid || 0
  const subPrice = client.subPrice || 0
  const hasPaidAllDues = subPrice > 0 ? paid >= subPrice : false
  const paymentProgress = subPrice > 0 ? Math.min((paid / subPrice) * 100, 100) : 0

  return (
    <div
      dir="rtl"
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 transform hover:scale-[1.02] ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'}`}
      style={{ willChange: 'transform, boxShadow', contain: 'layout style paint' }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 relative">
        {selectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(client.id)}
            className="absolute top-3 right-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
        )}
        <button
          onClick={() => onEdit(client)}
          className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          title="تعديل"
        >
          <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
        </button>
        <div className="mt-2">
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faUser} className="h-6 w-6 ml-2" />
            <h3 className="text-xl font-bold text-center">
              {client.first_name_ar} {client.last_name_ar}
            </h3>
          </div>
          <div className="flex items-center justify-center text-blue-100">
            <FontAwesomeIcon icon={faBirthdayCake} className="h-4 w-4 ml-1" />
            <span className="text-sm">العمر: {age} سنة</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {client.register_number && (
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faIdCard} className="h-4 w-4 ml-2 text-blue-500" />
              <span className="text-sm">رقم التسجيل: {client.register_number}</span>
            </div>
          )}
          {(client.phone_number || client.phoneNumber) && (
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faPhone} className="h-4 w-4 ml-2 text-green-500" />
              <span className="text-sm">{client.phone_number || client.phoneNumber}</span>
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMoneyBillWave} className="h-4 w-4 ml-2 text-green-600" />
              <span className="text-sm font-medium text-gray-700">حالة الدفع</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{Math.round(paymentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${paymentProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>المدفوع: {client.paid} د.ج</span>
            <span>المطلوب: {client.subPrice} د.ج</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faGraduationCap} className="h-4 w-4 ml-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">نتائج الاختبارات</span>
          </div>
          <TestResultBadge test={trafficLawTest} label="قانون المرور" />
          <TestResultBadge test={manoeuvresTest} label="المناورات" />
          {age >= 18 && <TestResultBadge test={drivingTest} label="القيادة" />}
        </div>
        {hasPassedAllTests && hasPaidAllDues && (
          <button
            onClick={() => onArchiveClient(client)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center font-medium"
          >
            <FontAwesomeIcon icon={faArchive} className="h-4 w-4 ml-2" />
            <span>أضف إلى الأرشيف</span>
          </button>
        )}
      </div>
    </div>
  )
})

// Enhanced Test Result Badge Component
const TestResultBadge = memo(function TestResultBadge({
  test = { passed: false, attempts: 0, lastAttemptDate: null },
  label
}) {
  const statusInfo = test.passed
    ? {
        icon: faCheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600',
        status: 'نجح'
      }
    : (test.attempts || 0) > 0
      ? {
          icon: faTimesCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600',
          status: 'رسب'
        }
      : {
          icon: faClock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600',
          status: 'مجدول'
        }

  return (
    <div className={`border rounded-lg p-2 ${statusInfo.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={statusInfo.icon}
            className={`h-4 w-4 ml-2 ${statusInfo.iconColor}`}
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs font-bold">{statusInfo.status}</span>
      </div>
      {test.attempts > 0 && (
        <div className="mt-1 text-xs opacity-75">
          المحاولات: {test.attempts}
          {test.lastAttemptDate && ` • آخر محاولة: ${test.lastAttemptDate}`}
        </div>
      )}
    </div>
  )
})

export default ClientCard

ClientCard.displayName = 'ClientCard'

ClientCard.propTypes = {
  client: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onEdit: PropTypes.func,
  onArchiveClient: PropTypes.func,
  selectionMode: PropTypes.bool,
  calculateAge: PropTypes.func
}

TestResultBadge.propTypes = {
  test: PropTypes.shape({
    passed: PropTypes.bool,
    attempts: PropTypes.number,
    lastAttemptDate: PropTypes.string
  }),
  label: PropTypes.string.isRequired
}
