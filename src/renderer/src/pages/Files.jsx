// Files.jsx
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { FolderIcon, TrashIcon, ArrowRightIcon, SearchIcon } from '@heroicons/react/outline'
import { ActionDialog } from '../components/'

const Files = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [folderError, setFolderError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch clients from the backend
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await window.api.readClients()
        setClients(clientsData)
        setFilteredClients(clientsData)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setError('فشل في تحميل بيانات العملاء. حاول مرة أخرى.')
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filter clients based on the search term
  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.first_name_ar.includes(searchTerm) ||
        client.last_name_ar.includes(searchTerm) ||
        client.national_id.includes(searchTerm)
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  // Handle client deletion
  const handleDelete = async (nationalId) => {
    try {
      await window.api.deleteClient(nationalId)
      setClients(clients.filter((client) => client.national_id !== nationalId))
    } catch (error) {
      console.error('Failed to delete client:', error)
      setError('فشل في حذف العميل. حاول مرة أخرى.')
    } finally {
      setDialogOpen(false)
    }
  }

  // Open folder handler with error handling and popup
  const handleOpenFolder = async (folderPath) => {
    try {
      const result = await window.api.openFolder(folderPath)
      if (!result.success) {
        setFolderError(result.message)
      }
    } catch (error) {
      console.error(`Failed to open folder at path ${folderPath}:`, error)
      setFolderError(`فشل في فتح الملف. تأكد من وجود المجلد (${folderPath}).`)
    }
  }

  // Show delete confirmation dialog
  const confirmDelete = (client) => {
    setSelectedClient(client)
    setDialogOpen(true)
  }

  // Cancel deletion
  const cancelDelete = () => {
    setSelectedClient(null)
    setDialogOpen(false)
  }

  // Clear folder error
  const closeFolderErrorDialog = () => {
    setFolderError(null)
  }

  return (
    <div dir="rtl" className="h-screen w-screen bg-gradient-to-r from-gray-100 to-gray-200 flex flex-col p-6 lg:p-10 overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-white rounded-3xl shadow-lg h-full flex flex-col">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">ملفات العملاء</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن العميل (الاسم أو رقم التعريف الوطني)..."
            className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-lg"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-6 lg:w-6" />
        </div>

        {/* Display the count of filtered clients */}
        <div className="mb-4 text-gray-600 text-lg font-semibold">
          عدد العملاء الموجودين: {filteredClients.length}
        </div>

        {/* Clients List */}
        <div className="flex-grow overflow-auto">
          <div className="bg-white shadow-lg rounded-3xl p-8">
            {loading ? (
              <div className="text-center text-xl font-semibold text-gray-600">
                جاري تحميل البيانات...
              </div>
            ) : error ? (
              <div className="text-center text-xl font-semibold text-red-600">{error}</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center text-xl font-semibold text-gray-600">
                لا توجد بيانات للعملاء.
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.national_id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-100 hover:to-indigo-50 transition-colors duration-300 rounded-3xl mb-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-200 p-3 rounded-full">
                      <FolderIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="text-xl font-semibold text-gray-800">
                      {client.first_name_ar} - {client.last_name_ar}
                    </div>
                  </div>
                  <div className="flex space-x-2 gap-3">
                    <button
                      onClick={() => handleOpenFolder(client.path)}
                      className="flex items-center px-4 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300"
                    >
                      <span className="ml-2">فتح الملف</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(client)}
                      className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition duration-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {selectedClient && (
        <ActionDialog
          isOpen={dialogOpen}
          type="confirm"
          message={`هل أنت متأكد من أنك تريد حذف ملف ${selectedClient.first_name_ar} ${selectedClient.last_name_ar}؟`}
          onConfirm={() => handleDelete(selectedClient.national_id)}
          onCancel={cancelDelete}
          onClose={cancelDelete}
        />
      )}

      {/* Folder Error Dialog */}
      {folderError && (
        <ActionDialog
          isOpen={!!folderError}
          type="message"
          message={folderError}
          onClose={closeFolderErrorDialog}
        />
      )}
    </div>
  )
}

export default Files