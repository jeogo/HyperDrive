import { useState } from 'react'
import { normalizeTestData } from '../../utils/testUtils'

const EditClientModal = ({ isOpen, onClose, client, calculateAge, onSave }) => {
  // Calculate the client's age
  const age = calculateAge(client.birth_date)

  // State to manage form inputs for client details and tests with proper type conversion
  const [registerNumber, setRegisterNumber] = useState(client.register_number || '')
  const [trafficLawTest, setTrafficLawTest] = useState(
    normalizeTestData(client.tests?.trafficLawTest)
  )
  const [manoeuvresTest, setManoeuvresTest] = useState(
    normalizeTestData(client.tests?.manoeuvresTest)
  )
  const [drivingTest, setDrivingTest] = useState(normalizeTestData(client.tests?.drivingTest))

  // Disable driving test input if the client is under 18
  const isDrivingTestDisabled = age < 18

  // Handle saving the updated client data
  const handleSave = () => {
    const updatedClient = {
      ...client,
      register_number: registerNumber,
      tests: {
        trafficLawTest,
        manoeuvresTest,
        // Driving test is disabled for clients under 18, ensure it's marked as not passed in such cases
        drivingTest: isDrivingTestDisabled ? { ...drivingTest, passed: false } : drivingTest
      }
    }
    onSave(updatedClient) // Trigger the save callback with updated client data
  }

  if (!isOpen) return null // Don't render the modal if it's not open

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl ml-3">👤</div>
              <div>
                <h2 className="text-2xl font-bold">تعديل بيانات المتدرب</h2>
                <p className="text-blue-100">
                  {client.first_name_ar} {client.last_name_ar} • العمر: {age} سنة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <div className="text-xl">✕</div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Client Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  📋 معلومات التسجيل
                </h3>

                {/* Register number input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">رقم التسجيل:</label>
                  <input
                    type="text"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="أدخل رقم التسجيل"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Test Results */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  🎓 نتائج الاختبارات
                </h3>

                <div className="space-y-4">
                  {/* Traffic Law Test */}
                  <TestInput
                    test={trafficLawTest}
                    label="اختبار قانون المرور"
                    setTest={setTrafficLawTest}
                    icon="📋"
                  />

                  {/* Manoeuvres Test */}
                  <TestInput
                    test={manoeuvresTest}
                    label="اختبار المناورات"
                    setTest={setManoeuvresTest}
                    icon="🔄"
                  />

                  {/* Driving Test */}
                  <TestInput
                    test={drivingTest}
                    label="اختبار القيادة"
                    setTest={setDrivingTest}
                    disabled={isDrivingTestDisabled}
                    icon="🚗"
                  />

                  {isDrivingTestDisabled && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ اختبار القيادة غير متاح للمتدربين تحت سن 18 سنة
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal actions */}
          <div className="flex justify-end mt-8 gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              💾 حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced TestInput component
const TestInput = ({ test, label, setTest, disabled = false, icon }) => (
  <div
    className={`border rounded-xl p-4 transition-all ${disabled ? 'bg-gray-100 opacity-50' : 'bg-white border-gray-200'}`}
  >
    <div className="flex items-center mb-3">
      <span className="text-xl ml-2">{icon}</span>
      <label className="font-medium text-gray-800">{label}</label>
    </div>

    <div className="space-y-3">
      {/* Pass/Fail Status */}
      <div className="flex items-center gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={`${label}-status`}
            checked={test.passed}
            onChange={() => setTest({ ...test, passed: true })}
            disabled={disabled}
            className="ml-2 h-4 w-4 text-green-600 focus:ring-green-500"
          />
          <span className="text-green-600 font-medium">نجح ✅</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={`${label}-status`}
            checked={!test.passed}
            onChange={() => setTest({ ...test, passed: false })}
            disabled={disabled}
            className="ml-2 h-4 w-4 text-red-600 focus:ring-red-500"
          />
          <span className="text-red-600 font-medium">رسب ❌</span>
        </label>
      </div>

      {/* Attempts */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">عدد المحاولات:</label>
        <input
          type="number"
          min="0"
          value={test.attempts}
          onChange={(e) => setTest({ ...test, attempts: parseInt(e.target.value) || 0 })}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Last Attempt Date */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">تاريخ آخر محاولة:</label>
        <input
          type="date"
          value={test.lastAttemptDate || ''}
          onChange={(e) => setTest({ ...test, lastAttemptDate: e.target.value })}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  </div>
)

export default EditClientModal
