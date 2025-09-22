// Register.jsx
import { useState } from 'react'
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
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons'
import { ActionDialog, InputField, SelectField } from '../components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Register = () => {
  const today = new Date()
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0] // At least 18 years old
  const minBirthDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0] // No older than 120 years

  const initialFormData = {
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
    paid: 0
  }

  const [formData, setFormData] = useState(initialFormData)
  const [showNonAlgerianInfo, setShowNonAlgerianInfo] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('message')
  const [dialogMessage, setDialogMessage] = useState('')

  // Validation function for form inputs
  const validateForm = () => {
    const { phone_number, paid, subPrice } = formData

    if (!/^\d{10}$/.test(phone_number)) {
      // Regex for 10 digits phone number
      setDialogMessage('رقم الهاتف يجب أن يتكون من 10 أرقام.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    if (paid < 0 || paid > subPrice) {
      setDialogMessage('المبلغ المدفوع غير صحيح.')
      setDialogType('error')
      setDialogOpen(true)
      return false
    }

    return true
  }

  // Generic handleChange function for inputs
  const handleChange = (e) => {
    const { name, value, type } = e.target
    let newValue = value

    if (type === 'number') {
      newValue = value ? parseInt(value, 10) : 0
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue
    }))
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const path = await window.api.generateClientPath(
        formData.first_name_ar,
        formData.last_name_ar
      )
      const updatedFormData = { ...formData, path }

      // Create the client and receive the newly created client data with _id
      const createdClient = await window.api.createClient(updatedFormData)
      console.log('Client created:', createdClient)
      setDialogMessage('تم حفظ البيانات بنجاح!')
      setDialogType('message')
      setDialogOpen(true)

      // Reset form after successful submission
      setFormData(initialFormData)
    } catch (err) {
      // Display the error message from the backend
      setDialogMessage(`حدث خطأ: ${err.message}`)
      setDialogType('error')
      setDialogOpen(true)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">👤 تسجيل متدرب جديد</h1>
            <p className="text-gray-600">إضافة بيانات متدرب جديد في نظام مدرسة تعليم السياقة</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        {/* Dialog for errors and success */}
        <ActionDialog
          isOpen={dialogOpen}
          type={dialogType}
          message={dialogMessage}
          onClose={closeDialog}
        />
        {/* Personal Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">👤</span>
            المعلومات الشخصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faUser}
              name="first_name_ar"
              value={formData.first_name_ar}
              placeholder="أدخل الاسم الأول بالعربية"
              onChange={handleChange}
              iconColor="text-green-500"
              label="الاسم الأول"
              required={true}
              helpText="يجب إدخال الاسم الأول كما هو مكتوب في بطاقة التعريف"
            />
            <InputField
              icon={faUser}
              name="last_name_ar"
              value={formData.last_name_ar}
              placeholder="أدخل اللقب بالعربية"
              onChange={handleChange}
              iconColor="text-blue-500"
              label="اللقب (اسم العائلة)"
              required={true}
              helpText="يجب إدخال اللقب كما هو مكتوب في بطاقة التعريف"
            />
            <SelectField
              icon={faVenusMars}
              name="gender"
              value={formData.gender}
              placeholder="اختر الجنس"
              onChange={handleChange}
              options={[
                { value: 'ذكر', label: 'ذكر' },
                { value: 'أنثى', label: 'أنثى' }
              ]}
              iconColor="text-purple-500"
              label="الجنس"
              required={true}
            />
          </div>
        </div>
        {/* Basic Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">📋</span>
            المعلومات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faIdCard}
              name="national_id"
              value={formData.national_id}
              placeholder="مثال: 123456789012345678"
              onChange={handleChange}
              maxLength="18"
              pattern="\d*"
              iconColor="text-blue-500"
              label="رقم التعريف الوطني"
              required={true}
              helpText="يجب إدخال 18 رقم كما هو مكتوب في بطاقة التعريف"
            />
            <SelectField
              icon={faTint}
              name="blood_type"
              value={formData.blood_type}
              placeholder="اختر فصيلة الدم"
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
              label="فصيلة الدم"
              required={true}
              helpText="فصيلة الدم كما هي مكتوبة في التقارير الطبية"
            />
          </div>
        </div>{' '}
        {/* Birth Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">📅</span>
            معلومات الميلاد
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faCalendarAlt}
              name="birth_date"
              type="date"
              value={formData.birth_date}
              placeholder="اختر تاريخ الميلاد"
              onChange={handleChange}
              min={minBirthDate}
              max={maxBirthDate}
              iconColor="text-yellow-500"
              label="تاريخ الميلاد"
              required={true}
              helpText="يجب أن يكون العمر 18 سنة أو أكثر"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_place"
              value={formData.birth_place}
              placeholder="مثال: الجزائر العاصمة"
              onChange={handleChange}
              iconColor="text-pink-500"
              label="مكان الميلاد"
              required={true}
              helpText="اسم المدينة أو المنطقة التي وُلدت فيها"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_municipality"
              value={formData.birth_municipality}
              placeholder="مثال: سيدي امحمد"
              onChange={handleChange}
              iconColor="text-pink-500"
              label="بلدية الميلاد"
              required={true}
              helpText="اسم البلدية كما هو مكتوب في شهادة الميلاد"
            />
            <InputField
              icon={faMapMarkerAlt}
              name="birth_state"
              value={formData.birth_state}
              placeholder="مثال: الجزائر"
              onChange={handleChange}
              iconColor="text-pink-500"
              label="ولاية الميلاد"
              required={true}
              helpText="اسم الولاية كما هو مكتوب في شهادة الميلاد"
            />
          </div>
        </div>
        {/* Parents Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">👨‍👩‍👧‍👦</span>
            معلومات الوالدين
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faUser}
              name="father_name"
              value={formData.father_name}
              placeholder="مثال: أحمد محمد"
              onChange={handleChange}
              iconColor="text-blue-500"
              label="اسم الأب الكامل"
              required={true}
              helpText="الاسم واللقب كما هو مكتوب في شهادة الميلاد"
            />
            <InputField
              icon={faUser}
              name="mother_first_name"
              value={formData.mother_first_name}
              placeholder="مثال: فاطمة"
              onChange={handleChange}
              iconColor="text-green-500"
              label="اسم الأم الأول"
              required={true}
              helpText="الاسم الأول للأم فقط"
            />
            <InputField
              icon={faUser}
              name="mother_last_name"
              value={formData.mother_last_name}
              placeholder="مثال: بن علي"
              onChange={handleChange}
              iconColor="text-green-500"
              label="لقب الأم"
              required={true}
              helpText="لقب عائلة الأم (قبل الزواج)"
            />
          </div>
        </div>
        {
          /* Current Address Information */
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              العنوان الحالي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <InputField
                icon={faPhone}
                name="phone_number"
                value={formData.phone_number}
                placeholder="مثال: 0555123456"
                onChange={handleChange}
                iconColor="text-blue-500"
                label="رقم الهاتف"
                required={true}
                helpText="رقم الهاتف يجب أن يكون 10 أرقام"
                maxLength="10"
                pattern="0\d{9}"
              />
            </div>
          </div>
        }
        {/* Family Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">👫</span>
            الحالة العائلية والتسجيل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              icon={faVenusMars}
              name="family_status"
              value={formData.family_status}
              placeholder="اختر الحالة العائلية"
              onChange={handleChange}
              options={[
                { value: 'single', label: 'أعزب(ة)' },
                { value: 'married', label: 'متزوج(ة)' },
                { value: 'divorced', label: 'مطلق(ة)' },
                { value: 'widowed', label: 'أرمل(ة)' }
              ]}
              iconColor="text-purple-500"
              label="الحالة العائلية"
              required={true}
            />
            <InputField
              icon={faCalendarAlt}
              name="register_date"
              type="date"
              value={formData.register_date}
              placeholder="تاريخ التسجيل"
              onChange={handleChange}
              iconColor="text-blue-500"
              label="تاريخ التسجيل"
              required={true}
              helpText="تاريخ تسجيل الطلب في المدرسة"
            />
          </div>
        </div>
        {/* Nationality Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">🏴</span>
            معلومات الجنسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faFlag}
              name="original_nationality"
              value={formData.original_nationality}
              placeholder="مثال: جزائرية"
              onChange={handleChange}
              iconColor="text-red-500"
              label="الجنسية الأصلية"
              required={true}
              helpText="الجنسية المكتوبة في وثائق الهوية"
            />
            <InputField
              icon={faFlag}
              name="acquired_nationality"
              value={formData.acquired_nationality}
              placeholder="مثال: فرنسية (اختياري)"
              onChange={handleChange}
              iconColor="text-red-500"
              label="الجنسية المكتسبة"
              helpText="في حالة وجود جنسية أخرى مكتسبة"
            />
          </div>
        </div>
        {/* Payment Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">💰</span>
            معلومات الدفع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={faMoneyBill}
              name="subPrice"
              type="number"
              value={formData.subPrice}
              placeholder="مثال: 6000"
              onChange={handleChange}
              min="0"
              iconColor="text-yellow-500"
              label="سعر الملف الإجمالي (دج)"
              required={true}
              helpText="المبلغ الإجمالي المطلوب للملف"
            />
            <InputField
              icon={faMoneyBill}
              name="paid"
              type="number"
              value={formData.paid}
              placeholder="مثال: 3000"
              onChange={handleChange}
              min="0"
              max={formData.subPrice}
              iconColor="text-green-500"
              label="المبلغ المدفوع (دج)"
              required={true}
              helpText={`المبلغ المدفوع حالياً (الحد الأقصى: ${formData.subPrice} دج)`}
            />
          </div>
        </div>
        {/* Non-Algerian Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">🌍</span>
            معلومات المقيمين الأجانب
          </h2>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="non_algerian_info"
                className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                checked={showNonAlgerianInfo}
                onChange={() => setShowNonAlgerianInfo(!showNonAlgerianInfo)}
              />
              <label
                htmlFor="non_algerian_info"
                className="text-gray-700 text-base font-medium mr-3"
              >
                تفعيل المعلومات الخاصة بالمقيمين الأجانب
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-2 mr-8">
              قم بتفعيل هذا الخيار إذا كان المتقدم من غير حاملي الجنسية الجزائرية
            </p>
          </div>

          {showNonAlgerianInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={faFlag}
                name="country_of_birth"
                value={formData.country_of_birth}
                placeholder="مثال: المغرب"
                onChange={handleChange}
                iconColor="text-red-500"
                label="بلد الميلاد"
                helpText="بلد الميلاد للمقيمين الأجانب"
              />
              <InputField
                icon={faFlag}
                name="embassy_or_consulate"
                value={formData.embassy_or_consulate}
                placeholder="مثال: السفارة المغربية"
                onChange={handleChange}
                iconColor="text-red-500"
                label="السفارة أو القنصلية"
                helpText="الجهة المسؤولة عن التسجيل والتوثيق"
              />
            </div>
          )}
        </div>
        {/* Submit Button */}
        <div className="flex justify-center pt-8 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg"
          >
            <FontAwesomeIcon icon={faSave} className="ml-2" />
            💾 حفظ البيانات
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
