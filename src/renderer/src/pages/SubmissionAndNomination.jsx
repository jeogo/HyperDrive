// SubmissionAndNomination.jsx

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ClientCard from '../components/SubmissionAndNomination/ClientCard'
import ActionDialog from '../components/Messages/ActionDialog' // Import your ActionDialog for better alerts and confirmations

const SubmissionAndNomination = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState([])
  const [viewMode, setViewMode] = useState('default') // 'default', 'addToDeposit', 'printDeposit'
  const [filter, setFilter] = useState('all') // 'all', 'added', 'notAdded'
  const [searchTerm, setSearchTerm] = useState('') // For search input
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'message' }) // Dialog for alerts or confirmations

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

  // Handle client selection with a limit of 15 clients for both add and print
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

  // Set modes for adding or printing deposit folder
  const handleAddToDeposit = () => {
    setViewMode('addToDeposit')
    setSelectedClients([]) // Clear selections when switching modes
  }

  const handlePrintDeposit = () => {
    setViewMode('printDeposit')
    setSelectedClients([]) // Clear selections when switching modes
  }

  // Confirm actions for deposit or print
  const confirmAddToDeposit = async () => {
    if (selectedClients.length < 1) {
      setDialog({
        isOpen: true,
        message: 'يرجى تحديد متدرب واحد على الأقل.',
        type: 'message'
      })
      return
    }

    setDialog({
      isOpen: true,
      message: 'هل أنت متأكد من إضافة المتدربين إلى حافظة الإيداع؟',
      type: 'confirm',
      onConfirm: async () => {
        const updatedClients = []
        for (const client of selectedClients) {
          const updatedClient = { ...client, depositSubmitted: true }
          await window.api.updateClient(client.national_id, updatedClient)
          updatedClients.push(updatedClient)
        }

        setClients((prevClients) =>
          prevClients.map(
            (client) => updatedClients.find((uc) => uc.national_id === client.national_id) || client
          )
        )

        setDialog({
          isOpen: true,
          message: 'تمت إضافة المتدربين إلى حافظة الإيداع.',
          type: 'message'
        })
        setViewMode('default')
        setSelectedClients([])
      }
    })
  }

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
        setDialog({
          isOpen: true,
          message: 'تم إنشاء الملف وفتح حافظة الإيداع.',
          type: 'message'
        })
      } catch (error) {
        if (error.message.includes('EBUSY')) {
          setDialog({
            isOpen: true,
            message: 'الملف مفتوح أو مغلق، يرجى إغلاق الملف والمحاولة مرة أخرى.',
            type: 'confirm',
            onConfirm: async () => {
              // Allow the user to retry generating the PDF
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
        try {
          // Generate the deposit portfolio PDF with selected clients
          const outputPath = await window.api.generatePDF('depositPortfolio', selectedClients)

          // Automatically open the generated PDF file
          await window.api.openPath(outputPath)

          // Notify user that the PDF is opened
          setDialog({
            isOpen: true,
            message: 'تم إنشاء الملف وفتح حافظة الإيداع.',
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
        setViewMode('default')
        setSelectedClients([])
      },
      onCancel: () => {
        setDialog({ ...dialog, isOpen: false })
      }
    })
  }

  // Filter clients based on the mode and deposit status
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.first_name_ar.includes(searchTerm) || client.last_name_ar.includes(searchTerm)
    if (!matchesSearch) return false

    if (filter === 'added') return client.depositSubmitted
    if (filter === 'notAdded') return !client.depositSubmitted
    return true
  })

  const displayedClients = filteredClients.filter((client) => {
    if (viewMode === 'addToDeposit') return !client.depositSubmitted
    if (viewMode === 'printDeposit') return client.depositSubmitted
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
          <option value="added">مضاف إلى حافظة الإيداع</option>
          <option value="notAdded">غير مضاف إلى حافظة الإيداع</option>
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
          onClick={handleAddToDeposit}
          className={`${
            viewMode === 'addToDeposit' ? 'bg-blue-700' : 'bg-blue-600'
          } text-white hover:bg-blue-700 px-4 py-2 rounded-full transition duration-300 flex-1`}
        >
          اضافة الى حافظة الاداع
        </button>
        <button
          onClick={handlePrintDeposit}
          className={`${
            viewMode === 'printDeposit' ? 'bg-green-700' : 'bg-green-600'
          } text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 flex-1`}
        >
          طباعة حافظة الاداع
        </button>
      </div>

      {/* Bulk Action Buttons */}
      {selectedClients.length > 0 && (
        <div className="w-full max-w-5xl mx-auto mt-4 flex flex-col sm:flex-row gap-4">
          {viewMode === 'addToDeposit' && (
            <button
              onClick={confirmAddToDeposit}
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-full transition duration-300 w-full"
            >
              تأكيد الإضافة إلى حافظة الإيداع
            </button>
          )}
          {viewMode === 'printDeposit' && (
            <button
              onClick={confirmPrintDeposit}
              className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-full transition duration-300 w-full"
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
          ) : displayedClients.length === 0 ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">
              {viewMode === 'addToDeposit'
                ? 'لا يوجد متقدمين للإضافة إلى حافظة الإيداع.'
                : 'لا يوجد متقدمين في حافظة الإيداع للطباعة.'}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {displayedClients.map((client) => (
                <ClientCard
                  key={client.national_id}
                  client={client}
                  isSelected={selectedClients.some((c) => c.national_id === client.national_id)}
                  onSelect={handleSelectClient}
                  showCheckbox={viewMode !== 'default'} // Show checkbox only when viewMode is addToDeposit or printDeposit
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
