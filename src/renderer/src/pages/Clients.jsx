import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  ClientDetailsEdit,
  ClientDetails,
  Print,
  ActionDialog,
  usePopup,
  Filter,
  ClientCard
} from '../components/'
import { XIcon, FileText } from 'lucide-react' // Importing the download icon
import * as XLSX from 'xlsx'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const { isPopupOpen, popupContent, openPopup, closePopup } = usePopup()
  const [dialogProps, setDialogProps] = useState({
    isOpen: false,
    type: 'message',
    message: '',
    onConfirm: null,
    onCancel: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const showError = (errorMessage) => {
    setDialogProps({
      isOpen: true,
      type: 'message',
      message: errorMessage,
      onClose: closeDialog
    })
  }

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const clients = await window.api.readClients()
        setClients(clients)
        setFilteredClients(clients)
        setLoading(false)
      } catch (error) {
        setError('فشل في تحميل البيانات.')
        showError(`فشل في تحميل البيانات: ${error.message}`)
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const applyFilters = (searchTerm, selectedMonth, selectedYear) => {
    let filtered = clients

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.first_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.last_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone_number.includes(searchTerm)
      )
    }

    if (selectedMonth) {
      filtered = filtered.filter((client) => {
        const clientMonth = new Date(client.register_date).getMonth() + 1
        return clientMonth === parseInt(selectedMonth)
      })
    }

    if (selectedYear) {
      filtered = filtered.filter((client) => {
        const clientYear = new Date(client.register_date).getFullYear()
        return clientYear === parseInt(selectedYear)
      })
    }

    setFilteredClients(filtered)
  }

  const handleSave = async (updatedClient) => {
    setDialogProps({
      isOpen: true,
      type: 'confirm',
      message: 'هل أنت متأكد أنك تريد حفظ التغييرات؟',
      onConfirm: async () => {
        try {
          await window.api.updateClient(updatedClient.national_id, updatedClient)
          setClients((prevClients) =>
            prevClients.map((client) =>
              client.national_id === updatedClient.national_id ? updatedClient : client
            )
          )
          setDialogProps({
            isOpen: true,
            type: 'message',
            message: 'تم حفظ التعديلات بنجاح',
            onClose: closeDialog
          })
          closePopup()
        } catch (error) {
          showError(`فشل في حفظ التغييرات: ${error.message}`)
        }
      },
      onCancel: closeDialog
    })
  }

  const closeDialog = () => {
    setDialogProps((prevProps) => ({
      ...prevProps,
      isOpen: false
    }))
  }

  // Function to export clients data to Excel with all fields
  const exportToExcel = () => {
    const excelData = clients.map((client) => ({
      'الاسم الكامل': `${client.first_name_ar} ${client.last_name_ar}`, // Full name
      'رقم البطاقة الوطنية': client.national_id, // National ID
      'فصيلة الدم': client.blood_type, // Blood type
      النوع: client.gender === 'male' ? 'ذكر' : 'أنثى', // Gender (male/female)
      'تاريخ الميلاد': client.birth_date, // Birth date
      'مكان الميلاد': client.birth_place, // Birth place
      'بلدية الميلاد': client.birth_municipality, // Birth municipality
      'ولاية الميلاد': client.birth_state, // Birth state
      'اسم الأب': client.father_name, // Father's name
      'اسم الأم': `${client.mother_first_name} ${client.mother_last_name}`, // Mother's full name
      'العنوان الحالي': client.current_address, // Current address
      'بلدية الإقامة': client.current_municipality, // Current municipality
      'ولاية الإقامة': client.current_state, // Current state
      'الحالة الاجتماعية': client.family_status === 'single' ? 'أعزب' : 'متزوج', // Family status
      'رقم الهاتف': client.phone_number, // Phone number
      'الجنسية الأصلية': client.original_nationality, // Original nationality
      'الجنسية المكتسبة': client.acquired_nationality || 'غير متوفرة', // Acquired nationality (if any)
      'تاريخ التسجيل': new Date(client.register_date).toLocaleDateString(), // Registration date
      'المبلغ المستحق': client.subPrice, // Subscription price
      'المبلغ المدفوع': client.paid // Amount paid
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData) // Convert data to sheet
    const workbook = XLSX.utils.book_new() // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء') // Add the sheet to the workbook
    XLSX.writeFile(workbook, 'قائمة_العملاء.xlsx') // Generate Excel file and trigger download
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-screen bg-gradient-to-r from-gray-100 to-gray-200 flex flex-col p-4 lg:p-10"
    >
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-white rounded-3xl shadow-lg h-full flex flex-col">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">إدارة العملاء</h1>

        {/* Display Client Count */}
        <div className="mb-4 text-xl font-semibold text-gray-700">
          عدد العملاء المتاحين: <span className="text-indigo-600">{filteredClients.length}</span>
        </div>

        {/* Small Export to Excel Button Positioned on the Left */}
        <div className="flex justify-start mb-4">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white w-24 flex items-center justify-center py-2 rounded-full hover:bg-green-700 transition duration-200"
            style={{ width: '100px' }}
          >
            <FileText className="mr-2 h-4 w-4" /> {/* Smaller Icon */}
            Excel
          </button>
        </div>

        {/* Filter Component */}
        <Filter onSearch={applyFilters} />

        {/* Clients List */}
        <div className="flex-grow overflow-y-auto max-h-[60vh] mt-8">
          {loading ? (
            <div className="text-center text-lg text-gray-600">جاري تحميل البيانات...</div>
          ) : error ? (
            <div className="text-center text-lg text-red-600">{error}</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <div className="mb-24" key={index}>
                <ClientCard
                  client={client}
                  onAction={(client, actionType) => {
                    if (actionType === 'edit') {
                      openPopup(
                        <ClientDetailsEdit
                          client={client}
                          onSave={handleSave}
                          onClose={closePopup}
                        />
                      )
                    } else if (actionType === 'view') {
                      openPopup(<ClientDetails client={client} onClose={closePopup} />)
                    } else if (actionType === 'print') {
                      openPopup(<Print client={client} onClose={closePopup} />)
                    }
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-lg text-gray-500">لا توجد بيانات لعرضها</div>
          )}
        </div>

        {/* Popup Content */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 lg:p-0">
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg max-w-full lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-200"
                onClick={closePopup}
              >
                <XIcon className="h-6 w-6 lg:h-8 lg:w-8" />
              </button>
              {popupContent}
            </div>
          </div>
        )}

        {/* Action Dialog */}
        <ActionDialog
          isOpen={dialogProps.isOpen}
          type={dialogProps.type}
          message={dialogProps.message}
          onConfirm={dialogProps.onConfirm}
          onCancel={dialogProps.onCancel}
          onClose={dialogProps.onClose}
        />
      </div>
    </div>
  )
}

export default Clients
