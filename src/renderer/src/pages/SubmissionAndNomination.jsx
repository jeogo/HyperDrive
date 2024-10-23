// SubmissionAndNomination.jsx

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ClientCard from '../components/SubmissionAndNomination/ClientCard'
import ActionDialog from '../components/Messages/ActionDialog'
import Pagination from '../components/SubmissionAndNomination/Pagination' // A pagination component
import { FixedSizeList as List } from 'react-window' // For virtualization

const SubmissionAndNomination = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState([])
  const [viewMode, setViewMode] = useState('default') // 'default' or 'printDeposit'
  const [filter, setFilter] = useState('all') // 'all', 'printed', 'notPrinted'
  const [searchTerm, setSearchTerm] = useState('') // For search input
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'message' })
  const [currentPage, setCurrentPage] = useState(1)
  const [clientsPerPage] = useState(50) // Adjust the number as needed
  const [monthFilter, setMonthFilter] = useState('') // For month filtering
  const [yearFilter, setYearFilter] = useState('') // For year filtering

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await window.api.readClients()

        // Filter out archived clients
        const activeClients = data.filter((client) => !client.archived)

        setClients(activeClients)
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setDialog({
          isOpen: true,
          message: 'خطأ في جلب بيانات المتدربين',
          type: 'message'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Handle client selection with a limit of 15 clients for printing
  const handleSelectClient = (client) => {
    setSelectedClients((prevSelected) => {
      if (prevSelected.some((c) => c._id === client._id)) {
        // Deselect client
        return prevSelected.filter((c) => c._id !== client._id)
      } else {
        // Select client with limit check
        if (prevSelected.length >= 15) {
          setDialog({
            isOpen: true,
            message: 'يمكنك اختيار 15 متدرب كحد أقصى.',
            type: 'message'
          })
          return prevSelected
        }
        return [...prevSelected, client]
      }
    })
  }

  // Select all clients on the current page
  const handleSelectAll = () => {
    const clientsToSelect = currentClients.filter(
      (client) => !selectedClients.some((c) => c._id === client._id)
    )

    if (selectedClients.length + clientsToSelect.length > 15) {
      setDialog({
        isOpen: true,
        message: 'تجاوز عدد المتدربين المحدد الحد الأقصى (15).',
        type: 'message'
      })
      return
    }

    setSelectedClients((prevSelected) => [...prevSelected, ...clientsToSelect])
  }

  // Deselect all clients
  const handleDeselectAll = () => {
    setSelectedClients([])
  }

  // Set mode for printing deposit folder
  const handlePrintDeposit = () => {
    setViewMode('printDeposit')
    setSelectedClients([]) // Clear selections when switching modes
  }

  // Confirm action for printing
  const confirmPrintDeposit = async () => {
    if (selectedClients.length < 1) {
      setDialog({
        isOpen: true,
        message: 'يرجى تحديد متدرب واحد على الأقل.',
        type: 'message'
      })
      return
    }

    const handleRetry = async () => {
      try {
        // Generate the PDF and open it
        const outputPath = await window.api.generatePDF('depositPortfolio', selectedClients)
        await window.api.openPath(outputPath)

        // Mark clients as printed
        const updatedClients = selectedClients.map((client) => ({ ...client, printed: true }))
        for (const client of updatedClients) {
          await window.api.updateClient(client._id, client)
        }

        // Update clients in state
        setClients((prevClients) =>
          prevClients.map((client) => updatedClients.find((uc) => uc._id === client._id) || client)
        )

        setDialog({
          isOpen: true,
          message: 'تم إنشاء الملف وفتح حافظة الإيداع. المتدربين تم وضع علامة مطبوعة عليهم.',
          type: 'message'
        })
      } catch (error) {
        if (error.message.includes('EBUSY')) {
          setDialog({
            isOpen: true,
            message: 'الملف مفتوح أو مغلق، يرجى إغلاق الملف والمحاولة مرة أخرى.',
            type: 'confirm',
            onConfirm: async () => {
              await handleRetry()
            },
            onCancel: () => {
              setDialog({ ...dialog, isOpen: false })
            }
          })
        } else {
          setDialog({
            isOpen: true,
            message: 'فشل في إنشاء أو فتح ملف PDF. يرجى المحاولة لاحقًا.',
            type: 'message'
          })
        }
      }
    }

    setDialog({
      isOpen: true,
      message: 'هل أنت متأكد من طباعة حافظة الإيداع للمتدربين المحددين؟',
      type: 'confirm',
      onConfirm: async () => {
        await handleRetry()
        setViewMode('default')
        setSelectedClients([])
      },
      onCancel: () => {
        setDialog({ ...dialog, isOpen: false })
      }
    })
  }

  // Filter clients based on printed status, search term, and date filters
  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      client.first_name_ar.toLowerCase().includes(search) ||
      client.last_name_ar.toLowerCase().includes(search) ||
      client.national_id?.includes(search)

    if (!matchesSearch) return false

    const registerDate = new Date(client.register_date)
    const matchesMonth = monthFilter ? registerDate.getMonth() + 1 === parseInt(monthFilter) : true
    const matchesYear = yearFilter ? registerDate.getFullYear() === parseInt(yearFilter) : true

    if (!matchesMonth || !matchesYear) return false

    if (filter === 'printed') return client.printed
    if (filter === 'notPrinted') return !client.printed
    return true
  })

  // Pagination logic
  const indexOfLastClient = currentPage * clientsPerPage
  const indexOfFirstClient = indexOfLastClient - clientsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage)

  // Virtualized List Item Renderer
  const Row = ({ index, style }) => {
    const client = currentClients[index]
    if (!client) return null
    return (
      <div style={style}>
        <ClientCard
          key={client._id}
          client={client}
          isSelected={selectedClients.some((c) => c._id === client._id)}
          onSelect={handleSelectClient}
          showCheckbox={viewMode === 'printDeposit'}
          printed={client.printed}
        />
      </div>
    )
  }

  return (
    <div dir="rtl" className="w-screen h-screen flex flex-col overflow-auto bg-gray-100">
      <Navbar />

      {/* Filter Section */}
      <div className="w-full max-w-5xl mx-auto mt-4 flex flex-col sm:flex-row gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع المتدربين</option>
          <option value="printed">مطبوعة</option>
          <option value="notPrinted">غير مطبوعة</option>
        </select>

        {/* Month Filter */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">كل الأشهر</option>
          {[...Array(12)].map((_, index) => (
            <option key={index} value={index + 1}>
              الشهر {index + 1}
            </option>
          ))}
        </select>

        {/* Year Filter */}
        <input
          type="number"
          placeholder="السنة"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
        />

        {/* Search input for filtering clients by name */}
        <input
          type="text"
          placeholder="ابحث عن المتدرب بالاسم أو رقم الهوية"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex-1"
        />

        <button
          onClick={handlePrintDeposit}
          className={`${
            viewMode === 'printDeposit' ? 'bg-green-700' : 'bg-green-600'
          } text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 flex-1`}
        >
          طباعة حافظة الإيداع
        </button>
      </div>

      {/* Bulk Action Buttons */}
      {viewMode === 'printDeposit' && (
        <div className="w-full max-w-5xl mx-auto mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full transition duration-300"
            >
              تحديد الكل في الصفحة
            </button>
            <button
              onClick={handleDeselectAll}
              className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-full transition duration-300"
            >
              إلغاء التحديد
            </button>
            <span className="text-lg font-semibold text-gray-700">
              {selectedClients.length} / 15 متدرب محدد
            </span>
          </div>

          {selectedClients.length > 0 && (
            <button
              onClick={confirmPrintDeposit}
              className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-full transition duration-300 flex-1"
            >
              تأكيد طباعة حافظة الإيداع
            </button>
          )}
        </div>
      )}

      <main className="flex-grow w-full flex flex-col items-center p-4 sm:p-8 overflow-auto">
        {/* Header Section */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            إيداع وترشيح المتقدمين
          </h1>
          <p className="text-md sm:text-lg text-gray-600 mt-4">
            إدارة بيانات المترشحين للاختبارات المختلفة.
          </p>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-4 sm:p-8">
          {loading ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">جاري تحميل البيانات...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">لا يوجد متقدمين متاحين.</p>
          ) : (
            <>
              {/* Virtualized List */}
              <List
                height={600} // Adjust based on your container size
                itemCount={currentClients.length}
                itemSize={160} // Adjust height based on ClientCard
                width="100%"
              >
                {Row}
              </List>

              {/* Pagination Component */}
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </div>
      </main>

      {/* Dialog for alerts and confirmations */}
      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog({ ...dialog, isOpen: false })}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default SubmissionAndNomination
