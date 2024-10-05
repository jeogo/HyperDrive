import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  MapIcon,
  IdentificationIcon,
  FlagIcon,
  HeartIcon,
  CashIcon,
  HomeIcon
} from '@heroicons/react/outline'

const ClientDetails = ({ client }) => {
  return (
    <div
      dir="rtl"
      className="w-full h-full p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl shadow-lg overflow-y-auto"
    >
      {/* Personal Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">المعلومات الشخصية</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <UserIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.first_name_ar}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <UserIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.last_name_ar}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <HeartIcon className="text-purple-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.gender}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <IdentificationIcon className="text-blue-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.national_id}</span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">المعلومات الأساسية</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <PhoneIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.phone_number}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <CalendarIcon className="text-yellow-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.birth_date}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <MapIcon className="text-pink-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.birth_place}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <MapIcon className="text-pink-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.birth_municipality}</span>
          </div>

          <div className="col-span-2 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <MapIcon className="text-pink-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.birth_state}</span>
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">معلومات الوالدين</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <UserIcon className="text-blue-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.father_name}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <UserIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.mother_first_name}</span>
          </div>

          <div className="col-span-2 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <UserIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.mother_last_name}</span>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">العنوان الحالي</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <HomeIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.current_address}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <MapIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.current_municipality}</span>
          </div>

          <div className="col-span-2 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <MapIcon className="text-green-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.current_state}</span>
          </div>
        </div>
      </div>

      {/* Family Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">الحالة العائلية</h2>
        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
          <HeartIcon className="text-purple-500 h-6 w-6 ml-3" />
          <span className="text-gray-700">{client?.family_status}</span>
        </div>
      </div>

      {/* Nationality */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">الجنسية</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <FlagIcon className="text-red-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.original_nationality}</span>
          </div>

          <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
            <FlagIcon className="text-red-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">{client?.acquired_nationality}</span>
          </div>
        </div>
      </div>

      {/* Blood Type */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">فصيلة الدم</h2>
        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
          <HeartIcon className="text-red-500 h-6 w-6 ml-3" />
          <span className="text-gray-700">{client?.blood_type}</span>
        </div>
      </div>

      {/* Registration Date */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">تاريخ التسجيل</h2>
        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
          <CalendarIcon className="text-yellow-500 h-6 w-6 ml-3" />
          <span className="text-gray-700">{client?.register_date}</span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">الدفع</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
            <CashIcon className="text-yellow-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">المبلغ المدفوع: {client?.paid}</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
            <CashIcon className="text-blue-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">المبلغ الكلي: {client?.subPrice}</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
            <CashIcon className="text-red-500 h-6 w-6 ml-3" />
            <span className="text-gray-700">المبلغ المتبقي: {client?.subPrice - client?.paid}</span>
          </div>
        </div>
      </div>

      {/* Non-Algerian Info */}
      {(client?.country_of_birth || client?.embassy_or_consulate) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">المعلومات لغير الجزائريين</h2>
          <div className="grid grid-cols-2 gap-4">
            {client?.country_of_birth && (
              <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
                <FlagIcon className="text-red-500 h-6 w-6 ml-3" />
                <span className="text-gray-700">{client?.country_of_birth}</span>
              </div>
            )}

            {client?.embassy_or_consulate && (
              <div className="col-span-1 flex items-center bg-white p-4 rounded-lg shadow-sm">
                <FlagIcon className="text-red-500 h-6 w-6 ml-3" />
                <span className="text-gray-700">{client?.embassy_or_consulate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDetails
