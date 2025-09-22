// Exams.jsx

import { useState, useEffect, useCallback, useMemo } from 'react'
import ClientCard from '../components/Exams/ClientCard'
import EditClientModal from '../components/Exams/EditClientModal'
import ActionDialog from '../components/Messages/ActionDialog'
import { normalizeClientTests } from '../utils/testUtils'
// Import calculateAge from utilities if available
// import { calculateAge } from '../utils/clientUtils'

const Exams = () => {
  // Define utility functions first
  // Function to calculate age
  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDifference = today.getMonth() - birth.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }, [])

  // Function to determine the next test for a client

  // Function to calculate counts for each test
  const calculateTestCounts = useCallback(
    (clientsData) => {
      let trafficLawCount = 0
      let manoeuvresCount = 0
      let drivingCount = 0

      clientsData.forEach((client) => {
        if (!client.tests.trafficLawTest.passed) {
          trafficLawCount++
        } else if (!client.tests.manoeuvresTest.passed) {
          manoeuvresCount++
        } else if (!client.tests.drivingTest.passed) {
          const age = calculateAge(client.birth_date)
          const isPaidInFull = client.paid >= client.subPrice
          if (age >= 18 && isPaidInFull) {
            drivingCount++
          }
        }
      })

      setTestCounts({
        totalCandidates: clientsData.length,
        trafficLawCandidates: trafficLawCount,
        manoeuvresCandidates: manoeuvresCount,
        drivingCandidates: drivingCount
      })
    },
    [calculateAge]
  )

  // State hooks - defined after utility functions
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Filters and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [testFilter, setTestFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all') // Added payment filter

  // Counts of candidates for each test
  const [testCounts, setTestCounts] = useState({
    totalCandidates: 0,
    trafficLawCandidates: 0,
    manoeuvresCandidates: 0,
    drivingCandidates: 0
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState(null)

  // Dialog state for notifications
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: '',
    type: 'message', // 'message' or 'confirm'
    onConfirm: null,
    onCancel: null
  })

  // Implement data fetching with caching
  const fetchAndCacheClients = useCallback(
    async (forceRefresh = false) => {
      // Check if we should use cached data
      if (dataLoaded && clients.length > 0 && !forceRefresh) {
        return clients // Return cached clients data
      }

      // Show loading indicator only for initial load, not refreshes
      if (!dataLoaded) {
        setLoading(true)
      }

      try {
        // First check if we have cached data in localStorage
        const lastFetchTime = localStorage.getItem('clientsLastFetchTime')
        const cachedData = localStorage.getItem('clientsData')
        const currentTime = new Date().getTime()

        // Use cache if it's less than 5 minutes old and we're not forcing a refresh
        if (
          !forceRefresh &&
          cachedData &&
          lastFetchTime &&
          currentTime - parseInt(lastFetchTime, 10) < 5 * 60 * 1000
        ) {
          const parsedData = JSON.parse(cachedData)
          setClients(parsedData)
          calculateTestCounts(parsedData)
          setDataLoaded(true)
          setLoading(false)
          return parsedData
        }

        // Fetch fresh data from API
        let data = await window.api.readClients()

        // Process and normalize client data
        data = data.map((client) =>
          normalizeClientTests({
            ...client,
            depositSubmitted: client.depositSubmitted ?? false,
            archived: client.archived ?? false,
            paid: client.paid ?? 0,
            subPrice: client.subPrice ?? 0
          })
        )

        // Filter out archived clients
        const activeClients = data.filter((client) => !client.archived)

        // Update state
        setClients(activeClients)
        calculateTestCounts(activeClients)

        // Cache the data
        localStorage.setItem('clientsData', JSON.stringify(activeClients))
        localStorage.setItem('clientsLastFetchTime', currentTime.toString())

        setDataLoaded(true)
        return activeClients
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setDialog({
          isOpen: true,
          message: 'فشل في جلب بيانات المتدربين.',
          type: 'message'
        })
        return []
      } finally {
        setLoading(false)
      }
    },
    [dataLoaded, clients.length, calculateTestCounts, setDialog]
  )

  // Fetch clients data on component mount
  useEffect(() => {
    fetchAndCacheClients()

    // Add refresh on focus - update data when the user comes back to the tab
    const handleFocus = () => {
      // Only refresh if data was already loaded before
      if (dataLoaded) {
        fetchAndCacheClients(true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchAndCacheClients, dataLoaded])

  // Function declarations moved to the top of the component

  // Use memoization for filtering logic to avoid unnecessary recalculations
  const filteredResults = useMemo(() => {
    // Don't filter if no data is loaded yet
    if (!dataLoaded || clients.length === 0) {
      return []
    }

    // Apply filters in optimized order from most restrictive to least restrictive
    let filtered = clients

    // Apply search term filter first (usually most restrictive)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          `${client.first_name_ar || ''} ${client.last_name_ar || ''}`
            .toLowerCase()
            .includes(search) ||
          (client.register_number || '').toLowerCase().includes(search) ||
          (client.phone || '').toLowerCase().includes(search)
      )
    }

    // Apply test filter
    if (testFilter !== 'all') {
      filtered = filtered.filter((client) => {
        // Early check for test property structure
        if (!client.tests) return false

        switch (testFilter) {
          case 'trafficLaw':
            return !client.tests.trafficLawTest.passed
          case 'manoeuvres':
            return !client.tests.manoeuvresTest.passed && client.tests.trafficLawTest.passed
          case 'driving': {
            const age = calculateAge(client.birth_date)
            const isPaidInFull = client.paid >= client.subPrice
            return (
              !client.tests.drivingTest.passed &&
              client.tests.trafficLawTest.passed &&
              client.tests.manoeuvresTest.passed &&
              age >= 18 &&
              isPaidInFull
            )
          }
          case 'completed':
            return (
              client.tests.trafficLawTest.passed &&
              client.tests.manoeuvresTest.passed &&
              client.tests.drivingTest.passed
            )
          default:
            return true
        }
      })
    }

    // Apply age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter((client) => {
        const age = calculateAge(client.birth_date)
        return ageFilter === 'under18' ? age < 18 : age >= 18
      })
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((client) => {
        const isPaidInFull = (client.paid || 0) >= (client.subPrice || 0)
        return paymentFilter === 'paid' ? isPaidInFull : !isPaidInFull
      })
    }

    return filtered
  }, [clients, searchTerm, testFilter, ageFilter, paymentFilter, dataLoaded, calculateAge])

  // Update filteredClients state whenever the memoized results change
  useEffect(() => {
    setFilteredClients(filteredResults)
  }, [filteredResults])

  // Function declarations moved to the memoized version above

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle test filter change
  const handleTestFilterChange = (e) => {
    setTestFilter(e.target.value)
  }

  // Handle age filter change
  const handleAgeFilterChange = (e) => {
    setAgeFilter(e.target.value)
  }

  // Handle payment filter change
  const handlePaymentFilterChange = (e) => {
    setPaymentFilter(e.target.value)
  }

  // Handle selection of clients
  const handleSelectClient = (client) => {
    const age = calculateAge(client.birth_date)
    const isPaidInFull = client.paid >= client.subPrice

    // Prevent selection if the client has passed all tests
    if (
      client.tests.trafficLawTest.passed &&
      client.tests.manoeuvresTest.passed &&
      client.tests.drivingTest.passed
    ) {
      setDialog({
        isOpen: true,
        message: `لا يمكن تحديد المتدرب ${client.first_name_ar} ${client.last_name_ar} لأنه اجتاز جميع الاختبارات.`,
        type: 'message'
      })
      return
    }

    // Prevent selection if the client is under 18 for driving test
    if (
      age < 18 &&
      !client.tests.drivingTest.passed &&
      client.tests.trafficLawTest.passed &&
      client.tests.manoeuvresTest.passed
    ) {
      setDialog({
        isOpen: true,
        message: `لا يمكن تحديد المتدرب ${client.first_name_ar} ${client.last_name_ar} لأنه أقل من 18 عامًا ولا يمكنه اجتياز اختبار القيادة.`,
        type: 'message'
      })
      return
    }

    // Prevent selection for driving test if not paid in full
    if (
      !isPaidInFull &&
      !client.tests.drivingTest.passed &&
      client.tests.trafficLawTest.passed &&
      client.tests.manoeuvresTest.passed
    ) {
      setDialog({
        isOpen: true,
        message: `لا يمكن تحديد المتدرب ${client.first_name_ar} ${client.last_name_ar} لاختبار القيادة لأنه لم يقم بدفع المبلغ كاملاً.`,
        type: 'message'
      })
      return
    }

    setSelectedClients((prevSelected) => {
      let newSelected
      if (prevSelected.some((c) => c._id === client._id)) {
        // Deselect the client
        newSelected = prevSelected.filter((c) => c._id !== client._id)
      } else {
        // Select the client
        newSelected = [...prevSelected, client]
      }

      return newSelected
    })
  }

  // Handle edit button click
  const handleEditClient = (client) => {
    setCurrentClient(client)
    setIsModalOpen(true)
  }

  // Handle archiving a client
  const handleArchiveClient = async (client) => {
    setDialog({
      isOpen: true,
      message: `هل أنت متأكد من أرشفة المتدرب ${client.first_name_ar} ${client.last_name_ar}؟`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const updatedClient = { ...client, archived: true }
          await window.api.updateClient(updatedClient._id, updatedClient)

          setClients((prevClients) => prevClients.filter((c) => c._id !== client._id))

          setDialog({
            isOpen: true,
            message: `تمت أرشفة المتدرب ${client.first_name_ar} ${client.last_name_ar}.`,
            type: 'message'
          })
        } catch (error) {
          console.error('Failed to archive client:', error)
          setDialog({
            isOpen: true,
            message: 'فشل في أرشفة المتدرب.',
            type: 'message'
          })
        }
      },
      onCancel: () => setDialog({ ...dialog, isOpen: false })
    })
  }

  // Handle saving updated client data
  const handleSaveClient = async (updatedClient) => {
    try {
      const updatedClientWithTests = {
        ...updatedClient,
        tests: updatedClient.tests
      }

      // Prevent marking driving test as passed if not paid in full
      if (updatedClient.tests.drivingTest.passed && updatedClient.paid < updatedClient.subPrice) {
        setDialog({
          isOpen: true,
          message: `لا يمكن وضع علامة اجتياز لاختبار القيادة للمتدرب ${updatedClient.first_name_ar} ${updatedClient.last_name_ar} لأنه لم يدفع المبلغ كاملاً.`,
          type: 'message'
        })
        return
      }

      await window.api.updateClient(updatedClientWithTests._id, updatedClientWithTests)

      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === updatedClient._id ? updatedClientWithTests : client
        )
      )

      // Recalculate counts after updating client
      calculateTestCounts(
        clients.map((client) =>
          client._id === updatedClient._id ? updatedClientWithTests : client
        )
      )

      setIsModalOpen(false)
      setCurrentClient(null)
    } catch (error) {
      console.error('Failed to update client:', error)
      setDialog({
        isOpen: true,
        message: 'فشل في تحديث بيانات المتدرب.',
        type: 'message'
      })
    }
  }

  // Handle printing - only load print functionality when needed

  // Handle final print action with optimized processing

  // Memoized function to get data for selected clients

  // Function to determine the next test for a client - moved to the top of the component

  // Handle Select All

  // Handle Deselect All

  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 إدارة الامتحانات</h1>
            <p className="text-gray-600">متابعة وإدارة بيانات المتدربين والامتحانات بسهولة</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <span className="text-blue-600 text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards Section */}
      {!selectionMode && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3 flex items-center">
            <span className="ml-2">📊</span>
            إحصائيات الامتحانات
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Candidates */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <span className="text-gray-600 text-2xl">👥</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">إجمالي المتدربين</h4>
              <p className="text-3xl font-bold text-gray-800">{testCounts.totalCandidates}</p>
              <div className="mt-2 text-xs text-gray-500">جميع المتدربين المسجلين</div>
            </div>

            {/* Traffic Law Candidates */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <span className="text-blue-600 text-2xl">📚</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-blue-700 mb-2">قانون المرور</h4>
              <p className="text-3xl font-bold text-blue-800">{testCounts.trafficLawCandidates}</p>
              <div className="mt-2 text-xs text-blue-600">بحاجة لاختبار قانون المرور</div>
            </div>

            {/* Manoeuvres Candidates */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <span className="text-green-600 text-2xl">🚗</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-green-700 mb-2">المناورات</h4>
              <p className="text-3xl font-bold text-green-800">{testCounts.manoeuvresCandidates}</p>
              <div className="mt-2 text-xs text-green-600">بحاجة لاختبار المناورات</div>
            </div>

            {/* Driving Candidates */}
            <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 text-center border border-orange-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <span className="text-orange-600 text-2xl">🛣️</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-orange-700 mb-2">القيادة النهائي</h4>
              <p className="text-3xl font-bold text-orange-800">{testCounts.drivingCandidates}</p>
              <div className="mt-2 text-xs text-orange-600">جاهز لاختبار القيادة</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3 flex items-center">
          <span className="ml-2">🚀</span>
          المرشحات السريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => {
              setTestFilter('all')
              setPaymentFilter('all')
              setAgeFilter('all')
              setSearchTerm('')
            }}
            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 text-center border border-gray-200 hover:border-gray-300"
          >
            <span className="text-2xl mb-2">🔄</span>
            <span className="text-xs font-medium text-gray-700">إعادة تعيين</span>
          </button>
          <button
            onClick={() => setTestFilter('trafficLaw')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center border-2 ${
              testFilter === 'trafficLaw'
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span className="text-2xl mb-2">📋</span>
            <span className="text-xs font-medium">قانون المرور</span>
          </button>
          <button
            onClick={() => setTestFilter('manoeuvres')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center border-2 ${
              testFilter === 'manoeuvres'
                ? 'bg-green-500 text-white border-green-600 shadow-lg'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }`}
          >
            <span className="text-2xl mb-2">🚗</span>
            <span className="text-xs font-medium">المناورات</span>
          </button>
          <button
            onClick={() => setTestFilter('driving')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center border-2 ${
              testFilter === 'driving'
                ? 'bg-orange-500 text-white border-orange-600 shadow-lg'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span className="text-2xl mb-2">🏁</span>
            <span className="text-xs font-medium">القيادة النهائي</span>
          </button>
          <button
            onClick={() => setPaymentFilter('notPaid')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center border-2 ${
              paymentFilter === 'notPaid'
                ? 'bg-red-500 text-white border-red-600 shadow-lg'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <span className="text-2xl mb-2">💰</span>
            <span className="text-xs font-medium">معلق الدفع</span>
          </button>
          <button
            onClick={() => setAgeFilter('under18')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 text-center border-2 ${
              ageFilter === 'under18'
                ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            <span className="text-2xl mb-2">⚠️</span>
            <span className="text-xs font-medium">أقل من 18</span>
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3 flex items-center">
          <span className="ml-2">🔍</span>
          البحث والفلترة المتقدمة
        </h3>

        {/* Enhanced Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ابحث بالاسم، رقم الهاتف، أو رقم التسجيل..."
              className="w-full p-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <span className="text-xl">🔍</span>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-2xl transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">نوع الاختبار</label>
            <select
              value={testFilter}
              onChange={handleTestFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 transition-all"
            >
              <option value="all">جميع أنواع الاختبارات</option>
              <option value="trafficLaw">لم يجتز قانون المرور</option>
              <option value="manoeuvres">لم يجتز المناورات</option>
              <option value="driving">لم يجتز القيادة</option>
              <option value="completed">اجتاز جميع الاختبارات</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">الفئة العمرية</label>
            <select
              value={ageFilter}
              onChange={handleAgeFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 transition-all"
            >
              <option value="all">جميع الأعمار</option>
              <option value="under18">أقل من 18 سنة</option>
              <option value="above18">18 سنة أو أكثر</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">حالة الدفع</label>
            <select
              value={paymentFilter}
              onChange={handlePaymentFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 transition-all"
            >
              <option value="all">جميع حالات الدفع</option>
              <option value="paid">مدفوع بالكامل</option>
              <option value="notPaid">لم يتم الدفع بالكامل</option>
            </select>
          </div>
        </div>

        {/* Enhanced Results Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <div className="text-sm text-gray-700">
                {searchTerm ||
                testFilter !== 'all' ||
                ageFilter !== 'all' ||
                paymentFilter !== 'all' ? (
                  <>
                    <span className="font-bold text-blue-700 text-lg">
                      {filteredClients.length}
                    </span>
                    <span> نتيجة مطابقة من أصل </span>
                    <span className="font-semibold text-gray-800">{clients.length}</span>
                    <span> متدرب</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-blue-700 text-lg">{clients.length}</span>
                    <span> متدرب مسجل في النظام</span>
                  </>
                )}
              </div>
            </div>
            {(searchTerm ||
              testFilter !== 'all' ||
              ageFilter !== 'all' ||
              paymentFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTestFilter('all')
                  setAgeFilter('all')
                  setPaymentFilter('all')
                }}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors font-medium"
              >
                مسح جميع المرشحات
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Results Display with Optimized Rendering */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : !dataLoaded ? (
          <div className="flex flex-col items-center justify-center py-16">
            <button
              onClick={() => fetchAndCacheClients(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
            >
              <span>🔄</span>
              <span>تحميل البيانات</span>
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">لا توجد نتائج مطابقة</p>
            <p className="text-gray-500">حاول تعديل معايير البحث أو المرشحات</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {/* Only render visible clients (virtual list concept) */}
              {filteredClients.slice(0, 50).map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  isSelected={selectedClients.some((c) => c._id === client._id)}
                  onSelect={handleSelectClient}
                  onEdit={handleEditClient}
                  onArchiveClient={handleArchiveClient}
                  selectionMode={selectionMode}
                  calculateAge={calculateAge}
                />
              ))}
              {filteredClients.length > 50 && (
                <div className="text-center p-4 border-t border-gray-200">
                  <p className="text-gray-600">يتم عرض 50 متدرب من أصل {filteredClients.length}</p>
                  <p className="text-sm text-gray-500">
                    قم بتحسين معايير البحث للحصول على نتائج أكثر دقة
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && currentClient && (
        <EditClientModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setCurrentClient(null)
          }}
          client={currentClient}
          calculateAge={calculateAge}
          onSave={handleSaveClient}
        />
      )}

      {/* Action Dialog for messages */}
      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default Exams
