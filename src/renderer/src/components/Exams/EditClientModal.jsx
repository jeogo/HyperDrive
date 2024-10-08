import { useState } from 'react'

const EditClientModal = ({ isOpen, onClose, client, calculateAge, onSave }) => {
  // Calculate the client's age
  const age = calculateAge(client.birth_date)

  // State to manage form inputs for client details and tests
  const [registerNumber, setRegisterNumber] = useState(client.register_number || '')
  const [trafficLawTest, setTrafficLawTest] = useState(
    client.tests?.trafficLawTest || { passed: false, attempts: 0, lastAttemptDate: null }
  )
  const [manoeuvresTest, setManoeuvresTest] = useState(
    client.tests?.manoeuvresTest || { passed: false, attempts: 0, lastAttemptDate: null }
  )
  const [drivingTest, setDrivingTest] = useState(
    client.tests?.drivingTest || { passed: false, attempts: 0, lastAttemptDate: null }
  )

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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">تعديل بيانات المتدرب</h2>

        {/* Form inputs */}
        <div className="space-y-6">
          {/* Register number input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">رقم التسجيل:</label>
            <input
              type="text"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="أدخل رقم التسجيل"
            />
          </div>

          {/* Traffic Law Test input */}
          <TestInput
            test={trafficLawTest}
            label="اختبار قانون المرور"
            setTest={setTrafficLawTest}
          />

          {/* Manoeuvres Test input */}
          <TestInput test={manoeuvresTest} label="اختبار المناورات" setTest={setManoeuvresTest} />

          {/* Driving Test input */}
          <TestInput
            test={drivingTest}
            label="اختبار القيادة"
            setTest={setDrivingTest}
            disabled={isDrivingTestDisabled} // Disable driving test if client is under 18
          />
        </div>

        {/* Modal actions (Cancel/Save buttons) */}
        <div className="flex justify-end mt-8 space-x-4 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-lg font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  )
}

// TestInput component to handle individual test inputs (traffic law, manoeuvres, driving)
const TestInput = ({ test, label, setTest, disabled }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}:</label>
    <div className={`grid grid-cols-2 gap-4 ${disabled ? 'opacity-50' : ''}`}>
      {/* Checkbox for test passed */}
      <input
        type="checkbox"
        checked={test.passed}
        onChange={(e) => setTest({ ...test, passed: e.target.checked })}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        disabled={disabled} // Disable if test is not allowed (e.g., underage)
      />
      <label>اجتاز الاختبار</label>

      {/* Number input for test attempts */}
      <input
        type="number"
        value={test.attempts}
        onChange={(e) => setTest({ ...test, attempts: e.target.value })}
        className="border border-gray-300 rounded-lg p-3 focus:outline-none text-lg"
        placeholder="عدد المحاولات"
        disabled={disabled} // Disable if test is not allowed
      />

      {/* Date input for last test attempt date */}
      <input
        type="date"
        value={test.lastAttemptDate || ''} // Handle null/empty date
        onChange={(e) => setTest({ ...test, lastAttemptDate: e.target.value })}
        className="border border-gray-300 rounded-lg p-3 focus:outline-none text-lg"
        disabled={disabled} // Disable if test is not allowed
      />
    </div>
  </div>
)

export default EditClientModal
