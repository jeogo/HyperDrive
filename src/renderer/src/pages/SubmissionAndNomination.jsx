import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/outline'
import ActionDialog from '../components/Messages/ActionDialog'
import { LoadingSpinner } from '../components/Loading'
import { useDebounceSearch } from '../hooks/useFastSearch'

const SubmissionAndNomination = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: '',
    type: 'message'
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClients, setSelectedClients] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Use fast debounced search hook
  const { searchResults, isSearching, search, searchQuery } = useDebounceSearch(300)

  // Helper function to get client field value (handles both old and new schema)
  const getClientField = (client, newField, oldField) => {
    return client[newField] || client[oldField] || ''
  }

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await window.api.readClients()
        console.log('Fetched clients data:', data) // Debug log
        setClients(data)
        setFilteredClients(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
        showDialog('فشل في تحميل بيانات المتدربين', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    let filtered = clients

    // Use search results if searching, otherwise show all clients
    if (searchQuery.trim()) {
      filtered = searchResults
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((client) => {
        switch (statusFilter) {
          case 'submitted':
            return client.submissionDate || client.depositSubmitted
          case 'pending':
            return !client.submissionDate && !client.depositSubmitted
          default:
            return true
        }
      })
    }

    setFilteredClients(filtered)
  }, [clients, searchResults, searchQuery, statusFilter])

  // Update selectAll state when filtered clients change
  useEffect(() => {
    if (filteredClients.length === 0) {
      setSelectAll(false)
    } else {
      const allSelected = filteredClients.every((client) =>
        selectedClients.has(client.id || client._id)
      )
      setSelectAll(allSelected)
    }
  }, [filteredClients, selectedClients])

  const showDialog = (message, type = 'message') => {
    setDialog({ isOpen: true, message, type })
  }

  const closeDialog = () => {
    setDialog({ isOpen: false, message: '', type: 'message' })
  }

  // Selection functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients(new Set())
      setSelectAll(false)
    } else {
      const allClientIds = filteredClients.map((client) => client.id || client._id)
      setSelectedClients(new Set(allClientIds))
      setSelectAll(true)
    }
  }

  const handleSelectClient = (clientId) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
    setSelectAll(newSelected.size === filteredClients.length)
  }

  // Batch submission functionality
  const handleBatchSubmission = async () => {
    console.log('Starting batch submission...')
    if (selectedClients.size === 0) {
      showDialog('يرجى اختيار متدربين للإيداع', 'error')
      return
    }

    setSubmitting(true)
    console.log('Set submitting to true')

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Batch submission timed out after 30 seconds')
      setSubmitting(false)
      showDialog('انتهت مهلة العملية. يرجى المحاولة مرة أخرى', 'error')
    }, 30000) // 30 seconds timeout

    const selectedClientsArray = Array.from(selectedClients)
    const submissionDate = new Date().toISOString().split('T')[0]
    const updatedClients = []

    try {
      console.log('Processing clients...', selectedClientsArray.length)
      for (const clientId of selectedClientsArray) {
        console.log('Processing client:', clientId)
        const client = clients.find((c) => (c.id || c._id) === clientId)
        if (!client) {
          console.error('Client not found:', clientId)
          continue
        }

        const updatedClient = {
          ...client,
          submissionDate,
          depositSubmitted: true,
          submissionStatus: 'submitted'
        }

        // Check if API exists
        if (!window.api) {
          throw new Error('API not available')
        }

        // Update client data
        console.log('Updating client data...')
        await window.api.updateClient(clientId, updatedClient)

        // Record submission in history
        console.log('Recording submission in history...')
        const submissionDetails = {
          type: 'deposit',
          date: submissionDate,
          status: 'submitted',
          method: 'batch',
          batchSize: selectedClientsArray.length
        }
        await window.api.recordSubmission(clientId, submissionDetails)

        updatedClients.push(updatedClient)
      }

      // Generate batch deposit document
      try {
        console.log('Generating deposit document...')
        const depositResult = await window.api.generateDepositDocx({
          candidates: updatedClients,
          pdfOnly: true,
          cache: false
        })
        console.log('Deposit result:', depositResult)

        if (depositResult && depositResult.success && depositResult.outputPath) {
          console.log('Batch deposit document generated:', depositResult.outputPath)
          // Auto-open the generated file
          await window.api.openPath(depositResult.outputPath)
          showDialog(`تم إيداع ${selectedClientsArray.length} متدرب وإنتاج المستند وفتحه بنجاح`)
        } else {
          showDialog(
            `تم إيداع ${selectedClientsArray.length} متدرب بنجاح ولكن فشل في إنتاج المستند`
          )
        }
      } catch (docError) {
        console.warn('Failed to generate deposit document:', docError)
        showDialog(`تم إيداع ${selectedClientsArray.length} متدرب بنجاح ولكن فشل في إنتاج المستند`)
      }

      // Update state
      console.log('Updating state...')
      setClients((prev) =>
        prev.map((c) => {
          const clientId = c.id || c._id
          const updatedClient = updatedClients.find((uc) => (uc.id || uc._id) === clientId)
          return updatedClient || c
        })
      )

      setSelectedClients(new Set())
      setSelectAll(false)
      console.log('Batch submission completed successfully')
    } catch (error) {
      console.error('Error batch submitting:', error)
      showDialog('فشل في عملية الإيداع الجماعي: ' + error.message, 'error')
    } finally {
      clearTimeout(timeoutId) // Clear the timeout
      console.log('Setting submitting to false')
      setSubmitting(false)
    }
  }

  const getSubmissionStats = () => {
    const submitted = clients.filter((c) => c.submissionDate || c.depositSubmitted).length
    const pending = clients.filter((c) => !c.submissionDate && !c.depositSubmitted).length

    return { submitted, pending, total: clients.length }
  }

  const getStatusColor = (client) => {
    if (client.submissionDate || client.depositSubmitted) {
      return 'text-green-600 bg-green-100'
    }
    return 'text-orange-600 bg-orange-100'
  }

  const getStatusText = (client) => {
    if (client.submissionDate || client.depositSubmitted) return 'مودع'
    return 'غير مودع'
  }

  const getStatusIcon = (client) => {
    if (client.submissionDate || client.depositSubmitted) return CheckCircleIcon
    return ClockIcon
  }

  const stats = getSubmissionStats()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="جاري تحميل بيانات المتدربين..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 إيداع المتدربين</h1>
            <p className="text-gray-600">إدارة إيداع المتدربين للامتحانات</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          📊 إحصائيات الإيداع
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg ml-3">
                <UserGroupIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">إجمالي المتدربين</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg ml-3">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">غير مودع</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg ml-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">مودع</p>
                <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Batch Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => search(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {isSearching && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" showText={false} />
              </div>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">جميع المتدربين</option>
            <option value="pending">غير مودع</option>
            <option value="submitted">مودع</option>
          </select>

          <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            عرض {filteredClients.length} من {clients.length} متدرب
          </div>

          <div className="flex items-center justify-center text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
            محدد: {selectedClients.size} متدرب
          </div>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectAll}
                readOnly
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              {selectAll ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>

            <button
              onClick={handleBatchSubmission}
              disabled={selectedClients.size === 0 || submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإيداع والإنتاج...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  إيداع وإنتاج ({selectedClients.size})
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            {selectedClients.size > 0 && (
              <span>سيتم إيداع وإنتاج ملف {selectedClients.size} متدرب</span>
            )}
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
            <p className="text-gray-500">
              {clients.length === 0
                ? 'لا يوجد متدربين في قاعدة البيانات'
                : 'لا توجد نتائج مطابقة للبحث المحدد'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              إجمالي المتدربين في قاعدة البيانات: {clients.length}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المتدرب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإيداع
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const StatusIcon = getStatusIcon(client)
                  return (
                    <tr key={client.id || client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedClients.has(client.id || client._id)}
                          onChange={() => handleSelectClient(client.id || client._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getClientField(client, 'firstName', 'first_name_ar')}{' '}
                          {getClientField(client, 'lastName', 'last_name_ar')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getClientField(client, 'phoneNumber', 'phone_number')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client)}`}
                        >
                          <StatusIcon className="h-4 w-4 ml-1" />
                          {getStatusText(client)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.submissionDate || (client.depositSubmitted ? 'مودع' : '-')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredClients.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border-t">
          <div className="flex flex-wrap items-center justify-between text-sm">
            <div className="flex gap-6">
              <span className="text-gray-600">
                الإجمالي:{' '}
                <span className="font-semibold text-gray-900">{filteredClients.length}</span>
              </span>
              <span className="text-orange-600">
                غير مودع:{' '}
                <span className="font-semibold">
                  {filteredClients.filter((c) => !c.submissionDate && !c.depositSubmitted).length}
                </span>
              </span>
              <span className="text-green-600">
                مودع:{' '}
                <span className="font-semibold">
                  {filteredClients.filter((c) => c.submissionDate || c.depositSubmitted).length}
                </span>
              </span>
            </div>
            <div className="text-xs text-gray-500">
              آخر تحديث: {new Date().toLocaleString('ar-SA')}
            </div>
          </div>
        </div>
      )}

      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={closeDialog}
        onCancel={closeDialog}
        onClose={closeDialog}
      />
    </div>
  )
}

export default SubmissionAndNomination
