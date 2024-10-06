import { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faIdCard,
  faTint,
  faUser,
  faVenusMars,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faFlag,
  faHome,
  faSave,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons'
import Navbar from '../components/Navbar'
import { ActionDialog } from '../components'

// Reusable Input Component
const InputField = ({
  icon,
  name,
  value,
  placeholder,
  onChange,
  type = 'text',
  pattern,
  min,
  maxLength,
  iconColor
}) => (
  <div className="flex-1">
    <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <FontAwesomeIcon icon={icon} className={`${iconColor} text-2xl ml-3`} />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        pattern={pattern}
        min={min}
        maxLength={maxLength}
      />
    </div>
  </div>
)

// Reusable Select Component
const SelectField = ({ icon, name, value, placeholder, onChange, options, iconColor }) => (
  <div className="flex-1">
    <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <FontAwesomeIcon icon={icon} className={`${iconColor} text-2xl ml-3`} />
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
)

const Register = () => {
  const today = new Date()
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0] // At least 18 years old
  const minBirthDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0] // No older than 120 years

  const [formData, setFormData] = useState({
    national_id: '',
    blood_type: '',
    last_name_ar: '',
    first_name_ar: '',
    gender: '',
    birth_date: '',
    birth_place: '',
    birth_municipality: '',
    birth_state: '',
    father_name: '',
    mother_first_name: '',
    mother_last_name: '',
    current_address: '',
    current_municipality: '',
    current_state: '',
    family_status: '',
    phone_number: '',
    original_nationality: '',
    acquired_nationality: '',
    country_of_birth: '',
    embassy_or_consulate: '',
    register_date: new Date().toISOString().split('T')[0], // Default to today's date
    subPrice: 6000,
    paid: 0,
    depositSubmitted: false,
    tests: {
      // Updated tests
      trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null }, // قانون المرور
      manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null }, // مناورات
      drivingTest: { passed: false, attempts: 0, lastAttemptDate: null } // السياقة
    }
  })

  const [showNonAlgerianInfo, setShowNonAlgerianInfo] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('message')
  const [dialogMessage, setDialogMessage] = useState('')

  // Validation function for form inputs
  const validateForm = () => {
    const { national_id, phone_number, paid, birth_date } = formData

    if (national_id.length !== 18) {
      setError('رقم التعريف الوطني يجب أن يتكون من 18 رقم.')
      setDialogMessage('رقم التعريف الوطني يجب أن يتكون من 18 رقم.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    if (phone_number.length !== 10) {
      setError('رقم الهاتف يجب أن يتكون من 10 أرقام.')
      setDialogMessage('رقم الهاتف يجب أن يتكون من 10 أرقام.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    const currentDate = new Date()
    const birthDate = new Date(birth_date)
    const minDate = new Date(
      currentDate.getFullYear() - 18,
      currentDate.getMonth(),
      currentDate.getDate()
    ) // Minimum age 18
    if (birthDate > currentDate || birthDate > minDate) {
      setError('تاريخ الميلاد غير صالح. يجب أن يكون عمر المتدرب 18 عامًا على الأقل.')
      setDialogMessage('تاريخ الميلاد غير صالح. يجب أن يكون عمر المتدرب 18 عامًا على الأقل.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    if (paid < 0 || paid > formData.subPrice) {
      setError('المبلغ المدفوع غير صحيح.')
      setDialogMessage('المبلغ المدفوع غير صحيح.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    return true
  }

  // Generic handleChange function for inputs
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target
    let newValue = value

    if (type === 'number') {
      newValue = parseInt(value, 10) || 0 // Default to 0 if parsing fails
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue
    }))
  }, [])

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return // Stop submission if validation fails
    }

    try {
      const path = await window.api.generateClientPath(
        formData.first_name_ar,
        formData.last_name_ar
      )
      const updatedFormData = { ...formData, path }

      await window.api.createClient(updatedFormData)
      setSuccess('تم حفظ البيانات بنجاح!')
      setError(null)
      setDialogMessage('تم حفظ البيانات بنجاح!')
      setDialogType('message')
      setDialogOpen(true)

      // Reset form after successful submission
      setFormData({
        national_id: '',
        blood_type: '',
        last_name_ar: '',
        first_name_ar: '',
        gender: '',
        birth_date: '',
        birth_place: '',
        birth_municipality: '',
        birth_state: '',
        father_name: '',
        mother_first_name: '',
        mother_last_name: '',
        current_address: '',
        current_municipality: '',
        current_state: '',
        family_status: '',
        phone_number: '',
        original_nationality: '',
        acquired_nationality: '',
        country_of_birth: '',
        embassy_or_consulate: '',
        register_date: new Date().toISOString().split('T')[0],
        subPrice: 6000,
        paid: 0,
        depositSubmitted: false,
        tests: {
          // Reset tests
          trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null },
          manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null },
          drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
        }
      })
    } catch (err) {
      setError(`حدث خطأ: ${err.message}`)
      setDialogMessage(`حدث خطأ: ${err.message}`)
      setDialogType('error')
      setDialogOpen(true)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  return (
    <div dir="rtl" className="w-screen h-screen overflow-y-auto bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-8 mt-10 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">تسجيل متدرب جديد</h1>

        {/* Dialog for errors and success */}
        <ActionDialog
          isOpen={dialogOpen}
          type={dialogType}
          message={dialogMessage}
          onClose={closeDialog}
        />

        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">المعلومات الشخصية</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faUser}
              name="first_name_ar"
              value={formData.first_name_ar}
              placeholder="الاسم بالعربية"
              onChange={handleChange}
              iconColor="text-green-500"
            />
            <InputField
              icon={faUser}
              name="last_name_ar"
              value={formData.last_name_ar}
              placeholder="اللقب بالعربية"
              onChange={handleChange}
              iconColor="text-blue-500"
            />
            <SelectField
              icon={faVenusMars}
              name="gender"
              value={formData.gender}
              placeholder="الجنس"
              onChange={handleChange}
              options={[
                { value: 'ذكر', label: 'ذكر' },
                { value: 'أنثى', label: 'أنثى' }
              ]}
              iconColor="text-purple-500"
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">المعلومات الأساسية</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faIdCard}
              name="national_id"
              value={formData.national_id}
              placeholder="رقم التعريف الوطني - 16 رقم"
              onChange={handleChange}
              pattern="\d{16}"
              maxLength="16"
              iconColor="text-blue-500"
            />
            <SelectField
              icon={faTint}
              name="blood_type"
              value={formData.blood_type}
              placeholder="فصيلة الدم"
              onChange={handleChange}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]}
              iconColor="text-red-500"
            />
          </div>
        </div>

        {/* Birth Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">معلومات الميلاد</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faCalendarAlt}
              name="birth_date"
              type="date"
              value={formData.birth_date}
              placeholder="تاريخ الميلاد"
              onChange={handleChange}
              min={minBirthDate}
              max={maxBirthDate} // Ensure birth date is not in the future and at least 18 years ago
              iconColor="text-yellow-500"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_place"
              value={formData.birth_place}
              placeholder="مكان الميلاد"
              onChange={handleChange}
              iconColor="text-pink-500"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_municipality"
              value={formData.birth_municipality}
              placeholder="بلدية الميلاد"
              onChange={handleChange}
              iconColor="text-pink-500"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_state"
              value={formData.birth_state}
              placeholder="ولاية الميلاد"
              onChange={handleChange}
              iconColor="text-pink-500"
            />
          </div>
        </div>

        {/* Parents Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">معلومات الوالدين</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faUser}
              name="father_name"
              value={formData.father_name}
              placeholder="اسم الأب"
              onChange={handleChange}
              iconColor="text-blue-500"
            />
            <InputField
              icon={faUser}
              name="mother_first_name"
              value={formData.mother_first_name}
              placeholder="اسم الأم الأول"
              onChange={handleChange}
              iconColor="text-green-500"
            />
            <InputField
              icon={faUser}
              name="mother_last_name"
              value={formData.mother_last_name}
              placeholder="لقب الأم"
              onChange={handleChange}
              iconColor="text-green-500"
            />
          </div>
        </div>

        {/* Current Address Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">العنوان الحالي</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faHome}
              name="current_address"
              value={formData.current_address}
              placeholder="العنوان الحالي"
              onChange={handleChange}
              iconColor="text-green-500"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="current_municipality"
              value={formData.current_municipality}
              placeholder="بلدية السكن"
              onChange={handleChange}
              iconColor="text-green-500"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="current_state"
              value={formData.current_state}
              placeholder="ولاية السكن"
              onChange={handleChange}
              iconColor="text-green-500"
            />
          </div>
        </div>

        {/* Family Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">الحالة العائلية</h2>
          <div className="flex flex-wrap gap-4">
            <SelectField
              icon={faVenusMars}
              name="family_status"
              value={formData.family_status}
              placeholder="الحالة العائلية"
              onChange={handleChange}
              options={[
                { value: 'single', label: 'أعزب(ة)' },
                { value: 'married', label: 'متزوج(ة)' },
                { value: 'divorced', label: 'مطلق(ة)' },
                { value: 'widowed', label: 'أرمل(ة)' }
              ]}
              iconColor="text-purple-500"
            />
            <InputField
              icon={faPhone}
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              placeholder="رقم الهاتف المحمول - 10 أرقام"
              onChange={handleChange}
              pattern="\d*"
              maxLength="10"
              iconColor="text-blue-500"
            />
          </div>
        </div>

        {/* Nationality Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">الجنسية</h2>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faFlag}
              name="original_nationality"
              value={formData.original_nationality}
              placeholder="الجنسية الأصلية"
              onChange={handleChange}
              iconColor="text-red-500"
            />
            <InputField
              icon={faFlag}
              name="acquired_nationality"
              value={formData.acquired_nationality}
              placeholder="الجنسية المكتسبة (إذا وجدت)"
              onChange={handleChange}
              iconColor="text-red-500"
            />
          </div>
        </div>
        {/* Payment Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">الدفع</h2>
          <h3 className="text-2xl mb-6 text-gray-700">ثمن الملف حاليا 6000</h3>
          <div className="flex flex-wrap gap-4">
            <InputField
              icon={faMoneyBill}
              name="paid"
              type="number"
              value={formData.paid}
              placeholder="المبلغ المدفوع"
              onChange={handleChange}
              min="0"
              max={formData.subPrice}
              iconColor="text-yellow-500"
            />
          </div>
        </div>

        {/* Non-Algerian Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">المعلومات لغير الجزائريين</h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="non_algerian_info"
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              checked={showNonAlgerianInfo}
              onChange={() => setShowNonAlgerianInfo(!showNonAlgerianInfo)}
            />
            <label htmlFor="non_algerian_info" className="text-gray-700 text-lg ml-3">
              تفعيل المعلومات لغير الجزائريين
            </label>
          </div>

          {showNonAlgerianInfo && (
            <div className="flex flex-wrap gap-4">
              <InputField
                icon={faFlag}
                name="country_of_birth"
                value={formData.country_of_birth}
                placeholder="بلد الميلاد لغير الجزائريين"
                onChange={handleChange}
                iconColor="text-red-500"
              />
              <InputField
                icon={faFlag}
                name="embassy_or_consulate"
                value={formData.embassy_or_consulate}
                placeholder="السفارة أو القنصلية للتسجيل"
                onChange={handleChange}
                iconColor="text-red-500"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FontAwesomeIcon icon={faSave} className="ml-2" />
            حفظ
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
