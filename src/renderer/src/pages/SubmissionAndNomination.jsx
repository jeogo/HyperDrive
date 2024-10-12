import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ClientCard from '../components/SubmissionAndNomination/ClientCard'
import ActionDialog from '../components/Messages/ActionDialog'

const SubmissionAndNomination = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState([])
  const [viewMode, setViewMode] = useState('default') // 'default' or 'printDeposit'
  const [filter, setFilter] = useState('all') // 'all', 'printed', 'notPrinted'
  const [searchTerm, setSearchTerm] = useState('') // For search input
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'message' })

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
      if (prevSelected.some((c) => c.national_id === client.national_id)) {
        return prevSelected.filter((c) => c.national_id !== client.national_id)
      } else {
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
        // Attempt to generate the PDF again after closing the dialog
        const outputPath = await window.api.generatePDF('depositPortfolio', selectedClients)
        await window.api.openPath(outputPath)

        // Mark clients as printed
        const updatedClients = selectedClients.map((client) => ({ ...client, printed: true }))
        for (const client of updatedClients) {
          await window.api.updateClient(client.national_id, client)
        }

        setClients((prevClients) =>
          prevClients.map(
            (client) => updatedClients.find((uc) => uc.national_id === client.national_id) || client
          )
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

  // Filter clients based on printed status and search term
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.first_name_ar.includes(searchTerm) || client.last_name_ar.includes(searchTerm)
    if (!matchesSearch) return false

    if (filter === 'printed') return client.printed
    if (filter === 'notPrinted') return !client.printed
    return true
  })

  // Display clients based on the current view mode
  const displayedClients = filteredClients.filter((client) => {
    if (viewMode === 'printDeposit') return true // All clients are eligible for printing
    return true
  })

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

        {/* Search input for filtering clients by name */}
        <input
          type="text"
          placeholder="ابحث عن المتدرب بالاسم"
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

      {/* Bulk Action Button */}
      {selectedClients.length > 0 && viewMode === 'printDeposit' && (
        <div className="w-full max-w-5xl mx-auto mt-4 flex flex-col sm:flex-row gap-4">
          <button
            onClick={confirmPrintDeposit}
            className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-full transition duration-300 w-full"
          >
            تأكيد طباعة حافظة الإيداع
          </button>
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
          ) : displayedClients.length === 0 ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">
              لا يوجد متقدمين متاحين للطباعة.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {displayedClients.map((client) => (
                <ClientCard
                  key={client.national_id}
                  client={client}
                  isSelected={selectedClients.some((c) => c.national_id === client.national_id)}
                  onSelect={handleSelectClient}
                  showCheckbox={viewMode === 'printDeposit'}
                  printed={client.printed}
                />
              ))}
            </div>
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
