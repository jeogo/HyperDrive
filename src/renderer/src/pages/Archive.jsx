import { useState, useEffect } from 'react'
import ArchiveClientCard from '../components/Archive/ArchiveClientCard'
import ActionDialog from '../components/Messages/ActionDialog'
import * as XLSX from 'xlsx'
import { calculateAge } from '../utils/clientUtils'

const Archive = () => {
  const [archivedClients, setArchivedClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: '',
    type: 'message',
    onConfirm: null
  })
  const [yearFilter, setYearFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchArchivedClients = async () => {
      try {
        const api = window.electronAPI || window.api
        let data = await (api.getClients ? api.getClients() : api.readClients())
        data = data.map((client) => ({
          ...client,
          archived: client.archived || false,
          isArchived: client.isArchived || false,
          registerDate: client.registerDate || client.register_date || null
        }))

        const archived = data.filter((client) => client.archived || client.isArchived)
        setArchivedClients(archived)
        setFilteredClients(archived)
      } catch (error) {
        console.error('Failed to fetch archived clients:', error)
        setDialog({
          isOpen: true,
          message: 'فشل في جلب بيانات الأرشيف',
          type: 'message'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArchivedClients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [yearFilter, monthFilter, searchTerm, archivedClients])

  const applyFilters = () => {
    let filtered = archivedClients

    if (yearFilter) {
      filtered = filtered.filter((client) => {
        const clientYear = client.registerDate ? new Date(client.registerDate).getFullYear() : null
        return clientYear === parseInt(yearFilter)
      })
    }

    if (monthFilter) {
      filtered = filtered.filter((client) => {
        const clientMonth = client.registerDate
          ? new Date(client.registerDate).getMonth() + 1
          : null
        return clientMonth === parseInt(monthFilter)
      })
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          `${client.firstName} ${client.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) || client.phoneNumber?.includes(searchTerm)
      )
    }

    setFilteredClients(filtered)
  }

  const handleUnarchiveClient = async (client) => {
    try {
      const updatedClient = {
        ...client,
        archived: false,
        isArchived: false
      }
      await (window.electronAPI || window.api).updateClient(client.id, updatedClient)

      setArchivedClients((prevClients) => prevClients.filter((c) => c.id !== client.id))

      setDialog({
        isOpen: true,
        message: `تم إلغاء أرشفة المتدرب ${client.firstName} ${client.lastName}`,
        type: 'message'
      })
    } catch (error) {
      console.error('Failed to unarchive client:', error)
      setDialog({
        isOpen: true,
        message: 'فشل في إلغاء أرشفة المتدرب',
        type: 'message'
      })
    }
  }

  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      setDialog({
        isOpen: true,
        message: 'لا توجد بيانات للتصدير',
        type: 'message'
      })
      return
    }

    const excelData = filteredClients.map((client) => ({
      'الاسم الكامل': `${client.firstName} ${client.lastName}`,
      'رقم الهاتف': client.phoneNumber,
      'تاريخ الميلاد': client.birthDate,
      العمر: calculateAge(client.birthDate),
      'رقم التسجيل': client.registerNumber || 'غير متوفر',
      'تاريخ التسجيل': client.registerDate || 'غير متوفر'
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الأرشيف')
    XLSX.writeFile(workbook, 'الأرشيف.xlsx')

    setDialog({
      isOpen: true,
      message: 'تم تصدير البيانات بنجاح',
      type: 'message'
    })
  }

  const getUniqueYears = (clients) => {
    const years = clients
      .map((client) => (client.registerDate ? new Date(client.registerDate).getFullYear() : null))
      .filter((year) => year !== null)
    return Array.from(new Set(years)).sort((a, b) => b - a)
  }

  const getMonthOptions = () => [
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'مايو' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليو' },
    { value: '8', label: 'أغسطس' },
    { value: '9', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' }
  ]

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🗃️ أرشيف العملاء</h1>
            <p className="text-gray-600">إدارة ومراجعة العملاء المؤرشفين</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 text-xl">📂</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع السنوات</option>
            {getUniqueYears(archivedClients).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الشهور</option>
            {getMonthOptions().map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={exportToExcel}
            disabled={filteredClients.length === 0}
            className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-300 flex items-center justify-center"
          >
            تصدير إلى Excel
          </button>
        </div>
      </div>

      {/* Archive Content */}
      <div className="bg-white rounded-xl shadow-sm">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {archivedClients.length === 0
                ? 'لا يوجد متدربين في الأرشيف'
                : 'لا توجد نتائج مطابقة للبحث'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredClients.map((client) => (
                <ArchiveClientCard
                  key={client.id}
                  client={client}
                  onUnarchiveClient={handleUnarchiveClient}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default Archive
