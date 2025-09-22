import { useState, useEffect, useCallback } from 'react'
import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon } from '@heroicons/react/outline'
import ActionDialog from '../components/Messages/ActionDialog'
import { StatusIndicator, DocumentAvailabilityIndicator } from '../components'
import { calculateAge } from '../utils/clientUtils'
import * as XLSX from 'xlsx'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // Add sorting state
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewMode, setViewMode] = useState(null) // 'view', 'edit', or null
  const [editData, setEditData] = useState({}) // Form data for editing
  const [saving, setSaving] = useState(false) // Loading state for save operation
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'message',
    message: '',
    onConfirm: null,
    onCancel: null
  })

  const [printDialog, setPrintDialog] = useState({
    isOpen: false,
    client: null
  })

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Get API reference
        const api = window.api
        if (!api) {
          throw new Error('API not available')
        }

        const data = await window.api.readClients()
        const activeClients = data.filter((client) => !client.archived && !client.isArchived)
        setClients(activeClients)
        setFilteredClients(activeClients)
      } catch (error) {
        console.error('Error fetching clients:', error)
        showDialog('فشل في تحميل بيانات العملاء', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    let filtered = clients

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((client) => {
        const firstName = getClientField(client, 'firstName', 'first_name_ar')
        const lastName = getClientField(client, 'lastName', 'last_name_ar')
        const phoneNumber = getClientField(client, 'phoneNumber', 'phone_number')
        const nationalId = getClientField(client, 'nationalId', 'national_id')

        return (
          `${firstName} ${lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phoneNumber?.includes(searchTerm) ||
          nationalId?.includes(searchTerm)
        )
      })
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const getDate = (client) => {
        const dateStr = client.register_date || client.registerDate || client.created_at
        return dateStr ? new Date(dateStr) : new Date(0)
      }

      switch (sortBy) {
        case 'newest':
          return getDate(b) - getDate(a) // Newest first
        case 'oldest':
          return getDate(a) - getDate(b) // Oldest first
        case 'name-asc': {
          const nameA =
            `${a.first_name_ar || a.firstName || ''} ${a.last_name_ar || a.lastName || ''}`.trim()
          const nameB =
            `${b.first_name_ar || b.firstName || ''} ${b.last_name_ar || b.lastName || ''}`.trim()
          return nameA.localeCompare(nameB, 'ar')
        }
        case 'name-desc': {
          const nameC =
            `${a.first_name_ar || a.firstName || ''} ${a.last_name_ar || a.lastName || ''}`.trim()
          const nameD =
            `${b.first_name_ar || b.firstName || ''} ${b.last_name_ar || b.lastName || ''}`.trim()
          return nameD.localeCompare(nameC, 'ar')
        }
        default:
          return 0
      }
    })

    setFilteredClients(filtered)
  }, [searchTerm, clients, sortBy])

  const showDialog = (message, type = 'message', onConfirm = null) => {
    setDialog({ isOpen: true, message, type, onConfirm })
  }

  const closeDialog = () => {
    setDialog({ isOpen: false, message: '', type: 'message', onConfirm: null })
  }

  const handleDeleteClient = async (clientId) => {
    const clientToDelete = clients.find((c) => (c.id || c._id) === clientId)
    const clientName = clientToDelete
      ? `${getClientField(clientToDelete, 'firstName', 'first_name_ar')} ${getClientField(clientToDelete, 'lastName', 'last_name_ar')}`
      : 'العميل'

    showDialog(
      `هل أنت متأكد من حذف ${clientName}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      'confirm',
      async () => {
        try {
          await window.api.deleteClient(clientId)
          setClients((prev) => prev.filter((c) => (c.id || c._id) !== clientId))
          setFilteredClients((prev) => prev.filter((c) => (c.id || c._id) !== clientId))

          // Close modal if deleted client was selected
          if (selectedClient && (selectedClient.id || selectedClient._id) === clientId) {
            setSelectedClient(null)
            setViewMode(null)
          }

          showDialog(`تم حذف ${clientName} بنجاح`, 'success')
        } catch (error) {
          console.error('Error deleting client:', error)
          showDialog('فشل في حذف العميل. يرجى المحاولة مرة أخرى.', 'error')
        }
      }
    )
  }

  const openPrintDialog = (client) => {
    setPrintDialog({
      isOpen: true,
      client: client
    })
  }

  const closePrintDialog = () => {
    setPrintDialog({
      isOpen: false,
      client: null
    })
  }

  const handlePrintTemplate = useCallback(
    async (templateName) => {
      try {
        const client = printDialog.client

        showDialog('جاري إنشاء المستند...', 'message')

        const outputPath = await window.api.generatePDF(templateName, {
          ...client,
          first_name_ar: client.first_name_ar || client.firstName,
          last_name_ar: client.last_name_ar || client.lastName,
          national_id: client.national_id || client.nationalId,
          phone_number: client.phone_number || client.phoneNumber,
          birth_date: client.birth_date || client.birthDate
        })

        if (outputPath) {
          const result = await window.api.openPath(outputPath)
          if (result) {
            showDialog(
              'فشل في فتح ملف الـPDF. يرجى إغلاق أي ملفات PDF مفتوحة وحاول مرة أخرى.',
              'error'
            )
          } else {
            showDialog('تم إنشاء وفتح المستند بنجاح!', 'success')
            closePrintDialog()
          }
        } else {
          showDialog('فشل في إنشاء المستند', 'error')
        }
      } catch (error) {
        console.error('Error printing template:', error)
        showDialog('حدث خطأ أثناء إنشاء المستند', 'error')
      }
    },
    [printDialog.client]
  )

  const handlePrintClient = useCallback((client) => {
    openPrintDialog(client)
  }, [])

  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      showDialog('لا توجد بيانات للتصدير', 'error')
      return
    }

    try {
      const excelData = filteredClients.map((client) => ({
        'الاسم الكامل': `${getClientField(client, 'firstName', 'first_name_ar')} ${getClientField(client, 'lastName', 'last_name_ar')}`,
        'رقم البطاقة الوطنية': getClientField(client, 'nationalId', 'national_id'),
        'فصيلة الدم': getClientField(client, 'bloodType', 'blood_type') || 'غير محدد',
        النوع: getClientField(client, 'gender', 'gender') === 'male' ? 'ذكر' : 'أنثى',
        'تاريخ الميلاد': getClientField(client, 'birthDate', 'birth_date'),
        'مكان الميلاد': getClientField(client, 'birthPlace', 'birth_place') || 'غير محدد',
        'رقم الهاتف': getClientField(client, 'phoneNumber', 'phone_number'),
        العنوان: getClientField(client, 'currentAddress', 'current_address') || 'غير محدد',
        'تاريخ التسجيل': getClientField(client, 'registerDate', 'register_date') || 'غير محدد',
        'المبلغ المستحق': getClientField(client, 'totalAmount', 'subPrice') || 0,
        'المبلغ المدفوع': getClientField(client, 'paidAmount', 'paid') || 0
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء')

      const fileName = `قائمة_العملاء_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`
      XLSX.writeFile(workbook, fileName)

      showDialog(`تم تصدير ${filteredClients.length} عميل بنجاح إلى ملف Excel`, 'success')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      showDialog('فشل في تصدير البيانات. يرجى المحاولة مرة أخرى.', 'error')
    }
  }

  // Helper function to get client field value (handles both old and new schema)
  // Database Schema (from CRUD operations in main/crud.js):
  // Personal: first_name_ar, last_name_ar, gender, national_id, blood_type, family_status
  // Birth: birth_date, birth_place, birth_municipality, birth_state, country_of_birth
  // Contact: phone_number, current_address, current_municipality, current_state
  // Parents: father_name, mother_first_name, mother_last_name
  // Nationality: original_nationality, acquired_nationality, embassy_or_consulate
  // Financial: subPrice, paid, register_date, deposit_submitted
  const getClientField = (client, newField, oldField) => {
    return client[newField] || client[oldField] || ''
  }

  // Helper component to render field (display or input based on mode)
  const renderField = (label, field, type = 'text', options = null, oldField = null) => {
    const isEditing = viewMode === 'edit'

    // Get the actual field name for old schema if provided
    const actualOldField = oldField || field

    // Get current value
    let currentValue = getClientField(selectedClient, field, actualOldField)

    // Handle boolean values for display
    if (type === 'select' && options && !isEditing) {
      const option = options.find(
        (opt) =>
          opt.value === currentValue ||
          opt.value === (currentValue === 'true' || currentValue === true)
      )
      currentValue = option ? option.label : currentValue
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {isEditing ? (
          type === 'select' ? (
            <select
              value={editData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            >
              <option value="">اختر...</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            />
          )
        ) : (
          <p className="mt-1 text-sm text-gray-900">{currentValue || 'غير محدد'}</p>
        )}
      </div>
    )
  }

  const openClientDetails = (client, mode) => {
    setSelectedClient(client)
    setViewMode(mode)

    // Initialize edit data when entering edit mode
    if (mode === 'edit') {
      setEditData({
        firstName: getClientField(client, 'firstName', 'first_name_ar'),
        lastName: getClientField(client, 'lastName', 'last_name_ar'),
        gender: getClientField(client, 'gender', 'gender'),
        nationalId: getClientField(client, 'nationalId', 'national_id'),
        bloodType: getClientField(client, 'bloodType', 'blood_type'),
        familyStatus: getClientField(client, 'familyStatus', 'family_status'),
        birthDate: getClientField(client, 'birthDate', 'birth_date'),
        birthPlace: getClientField(client, 'birthPlace', 'birth_place'),
        birthMunicipality: getClientField(client, 'birthMunicipality', 'birth_municipality'),
        birthState: getClientField(client, 'birthState', 'birth_state'),
        countryOfBirth: getClientField(client, 'countryOfBirth', 'country_of_birth'),
        phoneNumber: getClientField(client, 'phoneNumber', 'phone_number'),
        currentAddress: getClientField(client, 'currentAddress', 'current_address'),
        currentMunicipality: getClientField(client, 'currentMunicipality', 'current_municipality'),
        currentState: getClientField(client, 'currentState', 'current_state'),
        fatherName: getClientField(client, 'fatherName', 'father_name'),
        motherFirstName: getClientField(client, 'motherFirstName', 'mother_first_name'),
        motherLastName: getClientField(client, 'motherLastName', 'mother_last_name'),
        originalNationality: getClientField(client, 'originalNationality', 'original_nationality'),
        acquiredNationality: getClientField(client, 'acquiredNationality', 'acquired_nationality'),
        embassyOrConsulate: getClientField(client, 'embassyOrConsulate', 'embassy_or_consulate'),
        totalAmount: getClientField(client, 'totalAmount', 'subPrice'),
        paidAmount: getClientField(client, 'paidAmount', 'paid'),
        registerDate: getClientField(client, 'registerDate', 'register_date')
      })
    }
  }

  const closeClientDetails = () => {
    // Clear all modal state
    setSelectedClient(null)
    setViewMode(null)
    setEditData({})
    setSaving(false)

    // Close any open dialogs
    setDialog({
      isOpen: false,
      type: 'message',
      message: '',
      onConfirm: null,
      onCancel: null
    })
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveClient = async () => {
    if (!selectedClient) return

    setSaving(true)

    try {
      const clientId = selectedClient.id || selectedClient._id

      // Prepare updated client data using old schema field names for backend compatibility
      const updatedClientData = {
        ...selectedClient,
        first_name_ar: editData.firstName,
        last_name_ar: editData.lastName,
        gender: editData.gender,
        national_id: editData.nationalId,
        blood_type: editData.bloodType,
        family_status: editData.familyStatus,
        birth_date: editData.birthDate,
        birth_place: editData.birthPlace,
        birth_municipality: editData.birthMunicipality,
        birth_state: editData.birthState,
        country_of_birth: editData.countryOfBirth,
        phone_number: editData.phoneNumber,
        current_address: editData.currentAddress,
        current_municipality: editData.currentMunicipality,
        current_state: editData.currentState,
        father_name: editData.fatherName,
        mother_first_name: editData.motherFirstName,
        mother_last_name: editData.motherLastName,
        original_nationality: editData.originalNationality,
        acquired_nationality: editData.acquiredNationality,
        embassy_or_consulate: editData.embassyOrConsulate,
        subPrice: editData.totalAmount,
        paid: editData.paidAmount,
        register_date: editData.registerDate
      }

      await window.api.updateClient(clientId, updatedClientData)

      // Update local state
      setClients((prev) => prev.map((c) => ((c.id || c._id) === clientId ? updatedClientData : c)))
      setFilteredClients((prev) =>
        prev.map((c) => ((c.id || c._id) === clientId ? updatedClientData : c))
      )

      setSelectedClient(updatedClientData)
      setSaving(false)
      setViewMode('view')
      showDialog('تم حفظ التغييرات بنجاح', 'success')
    } catch (error) {
      console.error('Error updating client:', error)
      setSaving(false)
      showDialog('فشل في حفظ التغييرات. يرجى المحاولة مرة أخرى.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 إدارة العملاء</h1>
            <p className="text-gray-600">عرض وإدارة بيانات العملاء المسجلين في النظام</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-green-600 text-xl">👤</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{filteredClients.length}</div>
              <div className="text-sm text-blue-600 font-medium">عميل نشط</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          📊 إحصائيات العملاء
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="text-blue-600 text-xl">👥</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-600">إجمالي العملاء</h3>
                <p className="text-2xl font-bold text-blue-800">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="text-green-600 text-xl">📈</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-600">التسجيلات الجديدة</h3>
                <p className="text-2xl font-bold text-green-800">
                  {
                    clients.filter((client) => {
                      const registerDate = new Date(client.register_date || client.registerDate)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return registerDate >= thirtyDaysAgo
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="text-purple-600 text-xl">📊</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-600">معدل الإنجاز</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {clients.length > 0
                    ? Math.round(
                        (clients.filter((c) => c.paid >= c.subPrice).length / clients.length) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الهاتف أو البطاقة الوطنية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[200px]"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="name-asc">الاسم (أ-ي)</option>
              <option value="name-desc">الاسم (ي-أ)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-100 px-4 py-2 rounded-xl">
              <span className="text-gray-700 font-medium">
                عرض {filteredClients.length} من {clients.length} عميل
              </span>
            </div>

            <button
              onClick={exportToExcel}
              disabled={filteredClients.length === 0}
              className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <DownloadIcon className="h-5 w-5" />
              تصدير Excel
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="tex    t-xl font-bold text-gray-800 mb-2">لا توجد عملاء</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم تسجيل أي عملاء بعد'}
            </p>
            <div className="text-sm text-gray-500">إجمالي العملاء: {clients.length}</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      معلومات العميل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      الاتصال
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      التسجيل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      الحالة المالية
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client, index) => (
                    <tr
                      key={client.id || client._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold text-white">
                                {getClientField(client, 'firstName', 'first_name_ar')?.charAt(0)}
                                {getClientField(client, 'lastName', 'last_name_ar')?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-bold text-gray-900">
                              {getClientField(client, 'firstName', 'first_name_ar')}{' '}
                              {getClientField(client, 'lastName', 'last_name_ar')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getClientField(client, 'phoneNumber', 'phone_number')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getClientField(client, 'nationalId', 'national_id')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          📞 {getClientField(client, 'phoneNumber', 'phone_number')}
                        </div>
                        <div className="text-sm text-gray-500">
                          🎂 {calculateAge(getClientField(client, 'birthDate', 'birth_date'))} سنة
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          📅 {getClientField(client, 'registerDate', 'register_date') || 'غير محدد'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {client.paid || 0} / {client.subPrice || 0} دج
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((client.paid || 0) / (client.subPrice || 1)) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(((client.paid || 0) / (client.subPrice || 1)) * 100)}% مكتمل
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => openClientDetails(client, 'view')}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openClientDetails(client, 'edit')}
                            className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 p-2 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintClient(client)}
                            className="bg-green-100 text-green-600 hover:bg-green-200 p-2 rounded-lg transition-colors"
                            title="طباعة المستندات"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id || client._id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client, index) => (
                  <div
                    key={client.id || client._id || index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="h-16 w-16 flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                          <span className="text-lg font-bold text-white">
                            {getClientField(client, 'firstName', 'first_name_ar')?.charAt(0)}
                            {getClientField(client, 'lastName', 'last_name_ar')?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-gray-900 truncate">
                          {getClientField(client, 'firstName', 'first_name_ar')}{' '}
                          {getClientField(client, 'lastName', 'last_name_ar')}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          📱 {getClientField(client, 'phoneNumber', 'phone_number')}
                        </div>
                        <div className="text-sm text-gray-500">
                          🆔 {getClientField(client, 'nationalId', 'national_id')}
                        </div>
                        <div className="text-sm text-gray-500">
                          🎂 {calculateAge(getClientField(client, 'birthDate', 'birth_date'))} سنة
                        </div>
                        <div className="text-sm text-gray-500">
                          📅 {getClientField(client, 'registerDate', 'register_date') || 'غير محدد'}
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-2">
                          <StatusIndicator client={client} />
                        </div>

                        {/* Payment Progress */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الحالة المالية</span>
                            <span className="font-medium text-gray-900">
                              {client.paid || 0} / {client.subPrice || 0} دج
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((client.paid || 0) / (client.subPrice || 1)) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(((client.paid || 0) / (client.subPrice || 1)) * 100)}% مكتمل
                          </div>
                        </div>

                        {/* Document Availability Indicator */}
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                          <DocumentAvailabilityIndicator client={client} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 space-x-reverse mt-4">
                          <button
                            onClick={() => openClientDetails(client, 'view')}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors text-sm flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 ml-1" />
                            عرض
                          </button>
                          <button
                            onClick={() => openClientDetails(client, 'edit')}
                            className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-2 rounded-lg transition-colors text-sm flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 ml-1" />
                            تعديل
                          </button>
                          <button
                            onClick={() => handlePrintClient(client)}
                            className="bg-green-100 text-green-600 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors text-sm flex items-center"
                          >
                            <DownloadIcon className="h-4 w-4 ml-1" />
                            طباعة
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id || client._id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors text-sm flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 ml-1" />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {viewMode === 'edit' ? 'تعديل بيانات العميل' : 'تفاصيل العميل'}
                </h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  {viewMode === 'view' ? (
                    <button
                      onClick={() => setViewMode('edit')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                    >
                      تعديل
                    </button>
                  ) : (
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={handleSaveClient}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                            جارٍ الحفظ...
                          </>
                        ) : (
                          'حفظ'
                        )}
                      </button>
                      <button
                        onClick={() => setViewMode('view')}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm disabled:opacity-50 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                  <button
                    onClick={closeClientDetails}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="إغلاق"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    المعلومات الشخصية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('الاسم الأول', 'firstName', 'text', null, 'first_name_ar')}
                    {renderField('اسم العائلة', 'lastName', 'text', null, 'last_name_ar')}
                    {renderField(
                      'النوع',
                      'gender',
                      'select',
                      [
                        { value: 'ذكر', label: 'ذكر' },
                        { value: 'أنثى', label: 'أنثى' }
                      ],
                      'gender'
                    )}
                    {renderField('رقم البطاقة الوطنية', 'nationalId', 'text', null, 'national_id')}
                    {renderField(
                      'فصيلة الدم',
                      'bloodType',
                      'select',
                      [
                        { value: 'A+', label: 'A+' },
                        { value: 'A-', label: 'A-' },
                        { value: 'B+', label: 'B+' },
                        { value: 'B-', label: 'B-' },
                        { value: 'AB+', label: 'AB+' },
                        { value: 'AB-', label: 'AB-' },
                        { value: 'O+', label: 'O+' },
                        { value: 'O-', label: 'O-' }
                      ],
                      'blood_type'
                    )}
                    {renderField(
                      'الحالة الاجتماعية',
                      'familyStatus',
                      'select',
                      [
                        { value: 'أعزب', label: 'أعزب' },
                        { value: 'متزوج', label: 'متزوج' },
                        { value: 'مطلق', label: 'مطلق' },
                        { value: 'أرمل', label: 'أرمل' }
                      ],
                      'family_status'
                    )}
                  </div>
                </div>

                {/* Birth Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    معلومات الميلاد
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('تاريخ الميلاد', 'birthDate', 'date', null, 'birth_date')}
                    {/* Age is calculated, so show as read-only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">العمر</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {calculateAge(getClientField(selectedClient, 'birthDate', 'birth_date'))}{' '}
                        سنة
                      </p>
                    </div>
                    {renderField('مكان الميلاد', 'birthPlace', 'text', null, 'birth_place')}
                    {renderField(
                      'بلدية الميلاد',
                      'birthMunicipality',
                      'text',
                      null,
                      'birth_municipality'
                    )}
                    {renderField('ولاية الميلاد', 'birthState', 'text', null, 'birth_state')}
                    {renderField('بلد الميلاد', 'countryOfBirth', 'text', null, 'country_of_birth')}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    معلومات الاتصال
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('رقم الهاتف', 'phoneNumber', 'tel', null, 'phone_number')}
                    {renderField(
                      'العنوان الحالي',
                      'currentAddress',
                      'text',
                      null,
                      'current_address'
                    )}
                    {renderField(
                      'البلدية الحالية',
                      'currentMunicipality',
                      'text',
                      null,
                      'current_municipality'
                    )}
                    {renderField('الولاية الحالية', 'currentState', 'text', null, 'current_state')}
                  </div>
                </div>

                {/* Parents Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    معلومات الوالدين
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('اسم الأب', 'fatherName', 'text', null, 'father_name')}
                    {renderField(
                      'اسم الأم الأول',
                      'motherFirstName',
                      'text',
                      null,
                      'mother_first_name'
                    )}
                    {renderField(
                      'اسم عائلة الأم',
                      'motherLastName',
                      'text',
                      null,
                      'mother_last_name'
                    )}
                  </div>
                </div>

                {/* Nationality Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    معلومات الجنسية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                      'الجنسية الأصلية',
                      'originalNationality',
                      'text',
                      null,
                      'original_nationality'
                    )}
                    {renderField(
                      'الجنسية المكتسبة',
                      'acquiredNationality',
                      'text',
                      null,
                      'acquired_nationality'
                    )}
                    {renderField(
                      'السفارة أو القنصلية',
                      'embassyOrConsulate',
                      'text',
                      null,
                      'embassy_or_consulate'
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    المعلومات المالية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField('المبلغ المستحق', 'totalAmount', 'number', null, 'subPrice')}
                    {renderField('المبلغ المدفوع', 'paidAmount', 'number', null, 'paid')}
                    {/* Remaining amount is calculated, so show as read-only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        المبلغ المتبقي
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {(getClientField(selectedClient, 'totalAmount', 'subPrice') || 0) -
                          (getClientField(selectedClient, 'paidAmount', 'paid') || 0)}{' '}
                        دج
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                    معلومات التسجيل
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('تاريخ التسجيل', 'registerDate', 'date', null, 'register_date')}
                    {renderField(
                      'حالة الإيداع',
                      'depositSubmitted',
                      'select',
                      [
                        { value: true, label: 'تم الإيداع' },
                        { value: false, label: 'لم يتم الإيداع' }
                      ],
                      'deposit_submitted'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {printDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <DownloadIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">طباعة المستندات</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    اختر المستند الذي تريد طباعته للعميل:{' '}
                    {printDialog.client?.first_name_ar || printDialog.client?.firstName}{' '}
                    {printDialog.client?.last_name_ar || printDialog.client?.lastName}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="grid grid-cols-1 gap-3">
                    {/* 1. نموذج الاستمارة - Form Template */}
                    <button
                      onClick={() => handlePrintTemplate('formTemplate')}
                      className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-150"
                    >
                      نموذج الاستمارة
                    </button>

                    {/* 2. الشهادة الطبية - Medical Certificate */}
                    <button
                      onClick={() => handlePrintTemplate('medicalCertificate')}
                      className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-150"
                    >
                      الشهادة الطبية
                    </button>

                    {/* 3. بطاقة الإعداد للمناورات - Preparation Card */}
                    <button
                      onClick={() => handlePrintTemplate('preparationCard')}
                      className="px-4 py-2 bg-orange-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-150"
                    >
                      بطاقة الإعداد للمناورات
                    </button>

                    {/* 4. بطاقة دروس قانون المرور - Traffic Law Lessons Card */}
                    <button
                      onClick={() => handlePrintTemplate('trafficLawLessonsCard')}
                      className="px-4 py-2 bg-purple-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-150"
                    >
                      بطاقة دروس قانون المرور
                    </button>

                    {/* 5. ملف المتابعة - Follow Up File */}
                    <button
                      onClick={() => handlePrintTemplate('followUpFile')}
                      className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors duration-150"
                    >
                      ملف المتابعة
                    </button>
                  </div>
                  <button
                    onClick={closePrintDialog}
                    className="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
        onClose={closeDialog}
      />
    </div>
  )
}

export default Clients
