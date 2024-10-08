import { useState } from 'react'
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
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons'

const ClientDetailsEdit = ({ client, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(client)
  const [showNonAlgerianInfo, setShowNonAlgerianInfo] = useState(
    !!client?.non_algerian_info?.country_of_birth
  )

  const handleChange = (e) => {
    const { name, value, type } = e.target
    const newValue = type === 'number' ? parseInt(value, 10) : value

    setFormData({
      ...formData,
      [name]: newValue
    })
  }

  const handleSave = () => {
    onSave(formData)
  }

  const handleDelete = () => {
    onDelete(formData.national_id)
  }

  return (
    <div className="w-full h-full p-8 bg-white rounded-lg shadow-lg overflow-y-auto">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">تعديل بيانات العميل</h1>

      {/* Personal Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">المعلومات الشخصية</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faUser} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="first_name_ar"
                placeholder="الاسم بالعربية"
                value={formData.first_name_ar}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faUser} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="last_name_ar"
                placeholder="اللقب بالعربية"
                value={formData.last_name_ar}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 text-2xl ml-3" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">المعلومات الأساسية</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faIdCard} className="text-blue-500 text-2xl ml-3" />
              <input
                type="text"
                name="national_id"
                placeholder="رقم التعريف الوطني - 18 رقم"
                value={formData.national_id}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="18"
                pattern="\d*"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faTint} className="text-red-500 text-2xl ml-3" />
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">فصيلة الدم</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Birth Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">معلومات الميلاد</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-500 text-2xl ml-3" />
              <input
                type="date"
                name="birth_date"
                placeholder="تاريخ الميلاد"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-500 text-2xl ml-3" />
              <input
                type="text"
                name="birth_place"
                placeholder="مكان الميلاد"
                value={formData.birth_place}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-500 text-2xl ml-3" />
              <input
                type="text"
                name="birth_municipality"
                placeholder="بلدية الميلاد"
                value={formData.birth_municipality}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-500 text-2xl ml-3" />
              <input
                type="text"
                name="birth_state"
                placeholder="ولاية الميلاد"
                value={formData.birth_state}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registration Date */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">تاريخ التسجيل</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-500 text-2xl ml-3" />
              <input
                type="date"
                name="register_date"
                placeholder="تاريخ التسجيل"
                value={formData.register_date || new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">معلومات الوالدين</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faUser} className="text-blue-500 text-2xl ml-3" />
              <input
                type="text"
                name="father_name"
                placeholder="اسم الأب"
                value={formData.father_name}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faUser} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="mother_first_name"
                placeholder="اسم الأم الأول"
                value={formData.mother_first_name}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faUser} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="mother_last_name"
                placeholder="لقب الأم"
                value={formData.mother_last_name}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">العنوان الحالي</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faHome} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="current_address"
                placeholder="العنوان الحالي"
                value={formData.current_address}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="current_municipality"
                placeholder="بلدية السكن"
                value={formData.current_municipality}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 text-2xl ml-3" />
              <input
                type="text"
                name="current_state"
                placeholder="ولاية السكن"
                value={formData.current_state}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Family Status */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">الحالة العائلية</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 text-2xl ml-3" />
              <select
                name="family_status"
                value={formData.family_status}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">الحالة العائلية</option>
                <option value="single">أعزب(ة)</option>
                <option value="married">متزوج(ة)</option>
                <option value="divorced">مطلق(ة)</option>
                <option value="widowed">أرمل(ة)</option>
              </select>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faPhone} className="text-blue-500 text-2xl ml-3" />
              <input
                type="tel"
                name="phone_number"
                placeholder="رقم الهاتف المحمول - 10 أرقام"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="10"
                pattern="\d*"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nationality */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">الجنسية الأصلية</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faFlag} className="text-red-500 text-2xl ml-3" />
              <input
                type="text"
                name="original_nationality"
                placeholder="الجنسية الأصلية"
                value={formData.original_nationality}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faFlag} className="text-red-500 text-2xl ml-3" />
              <input
                type="text"
                name="acquired_nationality"
                placeholder="الجنسية المكتسبة (إذا وجدت)"
                value={formData.acquired_nationality}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">الدفع</h2>
        <h3 className="text-2xl mb-6 text-gray-700">ثمن الملف حاليا 6000</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={faMoneyBill} className="text-yellow-500 text-2xl ml-3" />
              <input
                type="number"
                name="paid"
                placeholder="المبلغ المدفوع"
                value={formData.paid}
                onChange={handleChange}
                className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Non-Algerian Info */}
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
            <div className="flex-1">
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faFlag} className="text-red-500 text-2xl ml-3" />
                <input
                  type="text"
                  name="country_of_birth"
                  placeholder="بلد الميلاد لغير الجزائريين"
                  value={formData.country_of_birth}
                  onChange={handleChange}
                  className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faFlag} className="text-red-500 text-2xl ml-3" />
                <input
                  type="text"
                  name="embassy_or_consulate"
                  placeholder="السفارة أو القنصلية للتسجيل"
                  value={formData.embassy_or_consulate}
                  onChange={handleChange}
                  className="w-full p-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onClose}
          className="bg-gray-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          إلغاء
        </button>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
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

export default ClientDetailsEdit
