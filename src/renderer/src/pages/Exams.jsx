// Exams.jsx

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ClientCard from '../components/Exams/ClientCard'
import EditClientModal from '../components/Exams/EditClientModal'
import ActionDialog from '../components/Messages/ActionDialog' // For user notifications

const Exams = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Filters and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [testFilter, setTestFilter] = useState('all') // 'all', 'trafficLaw', 'manoeuvres', 'driving', 'completed'
  const [ageFilter, setAgeFilter] = useState('all') // 'all', 'under18', 'above18'

  // Counts of candidates for each test
  const [testCounts, setTestCounts] = useState({
    totalCandidates: 0,
    trafficLawCandidates: 0,
    manoeuvresCandidates: 0,
    drivingCandidates: 0
  })

  // Counts for selected clients during selection mode
  const [selectedCounts, setSelectedCounts] = useState({
    totalCandidates: 0,
    trafficLawCount: 0,
    manoeuvresCount: 0,
    drivingCount: 0
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState(null)

  // Dialog state for notifications
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: '',
    type: 'message', // 'message' or 'confirm'
    onConfirm: null
  })

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let data = await window.api.readClients()
        // Ensure each client has all test properties and payment properties
        data = data.map((client) => ({
          ...client,
          depositSubmitted: client.depositSubmitted || false,
          archived: client.archived || false,
          paid: client.paid || 0,
          subPrice: client.subPrice || 0,
          tests: {
            trafficLawTest: client.tests?.trafficLawTest || {
              passed: false,
              attempts: 0,
              lastAttemptDate: null
            },
            manoeuvresTest: client.tests?.manoeuvresTest || {
              passed: false,
              attempts: 0,
              lastAttemptDate: null
            },
            drivingTest: client.tests?.drivingTest || {
              passed: false,
              attempts: 0,
              lastAttemptDate: null
            }
          }
        }))

        const filteredClients = data.filter(
          (client) => client.depositSubmitted === true && !client.archived
        )
        setClients(filteredClients)

        // Calculate counts for each test
        calculateTestCounts(filteredClients)
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setDialog({
          isOpen: true,
          message: 'فشل في جلب بيانات المتدربين.',
          type: 'message'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Function to calculate counts for each test
  const calculateTestCounts = (clientsData) => {
    let trafficLawCount = 0
    let manoeuvresCount = 0
    let drivingCount = 0

    clientsData.forEach((client) => {
      if (!client.tests.trafficLawTest.passed) {
        trafficLawCount++
      } else if (!client.tests.manoeuvresTest.passed) {
        manoeuvresCount++
      } else if (!client.tests.drivingTest.passed) {
        // Check if the client is eligible for the driving test (age >= 18)
        const age = calculateAge(client.birth_date)
        if (age >= 18) {
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
  }

  // Function to calculate counts based on selected clients
  const calculateSelectedCounts = (selectedClients) => {
    let totalCandidates = selectedClients.length
    let trafficLawCount = 0
    let manoeuvresCount = 0
    let drivingCount = 0

    selectedClients.forEach((client) => {
      const nextTest = getNextTestForClient(client)
      if (nextTest === 'اختبار قانون المرور') {
        trafficLawCount++
      } else if (nextTest === 'اختبار المناورات') {
        manoeuvresCount++
      } else if (nextTest === 'اختبار القيادة') {
        drivingCount++
      }
    })

    setSelectedCounts({
      totalCandidates,
      trafficLawCount,
      manoeuvresCount,
      drivingCount
    })
  }

  // Update filtered clients whenever filters or search term change
  useEffect(() => {
    let filtered = clients

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((client) =>
        `${client.first_name_ar} ${client.last_name_ar}`.includes(searchTerm)
      )
    }

    // Apply test filter
    if (testFilter !== 'all') {
      filtered = filtered.filter((client) => {
        if (testFilter === 'trafficLaw') {
          return !client.tests.trafficLawTest.passed
        } else if (testFilter === 'manoeuvres') {
          return !client.tests.manoeuvresTest.passed && client.tests.trafficLawTest.passed
        } else if (testFilter === 'driving') {
          const age = calculateAge(client.birth_date)
          return (
            !client.tests.drivingTest.passed &&
            client.tests.trafficLawTest.passed &&
            client.tests.manoeuvresTest.passed &&
            age >= 18
          )
        } else if (testFilter === 'completed') {
          return (
            client.tests.trafficLawTest.passed &&
            client.tests.manoeuvresTest.passed &&
            client.tests.drivingTest.passed
          )
        }
        return true
      })
    }

    // Apply age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter((client) => {
        const age = calculateAge(client.birth_date)
        if (ageFilter === 'under18') {
          return age < 18
        } else if (ageFilter === 'above18') {
          return age >= 18
        }
        return true
      })
    }

    setFilteredClients(filtered)
  }, [clients, searchTerm, testFilter, ageFilter])

  // Function to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDifference = today.getMonth() - birth.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

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

  // Handle selection of clients
  const handleSelectClient = (client) => {
    const age = calculateAge(client.birth_date)

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

    const isEligibleForDrivingTest =
      client.tests.trafficLawTest.passed && client.tests.manoeuvresTest.passed

    // Prevent selection if the client is under 18 and the next test is driving test
    if (age < 18 && !client.tests.drivingTest.passed && isEligibleForDrivingTest) {
      setDialog({
        isOpen: true,
        message: `لا يمكن تحديد المتدرب ${client.first_name_ar} ${client.last_name_ar} لأنه أقل من 18 عامًا ولا يمكنه اجتياز اختبار القيادة.`,
        type: 'message'
      })
      return
    }

    // Limit selection to 15 clients
    if (
      !selectedClients.find((c) => c.national_id === client.national_id) &&
      selectedClients.length >= 15
    ) {
      setDialog({
        isOpen: true,
        message: 'يمكنك اختيار 15 متدرب كحد أقصى.',
        type: 'message'
      })
      return
    }

    setSelectedClients((prevSelected) => {
      let newSelected
      if (prevSelected.find((c) => c.national_id === client.national_id)) {
        // Deselect the client
        newSelected = prevSelected.filter((c) => c.national_id !== client.national_id)
      } else {
        // Select the client
        newSelected = [...prevSelected, client]
      }

      // Calculate counts based on new selection
      calculateSelectedCounts(newSelected)

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
    try {
      const updatedClient = { ...client, archived: true }
      await window.api.updateClient(updatedClient.national_id, updatedClient)

      setClients((prevClients) => prevClients.filter((c) => c.national_id !== client.national_id))

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
  }

  // Handle saving updated client data
  const handleSaveClient = async (updatedClient) => {
    try {
      const age = calculateAge(updatedClient.birth_date)
      const tests = {
        trafficLawTest: updatedClient.tests.trafficLawTest || {
          passed: false,
          attempts: 0,
          lastAttemptDate: null
        },
        manoeuvresTest: updatedClient.tests.manoeuvresTest || {
          passed: false,
          attempts: 0,
          lastAttemptDate: null
        },
        drivingTest: updatedClient.tests.drivingTest || {
          passed: false,
          attempts: 0,
          lastAttemptDate: null
        }
      }

      if (
        age < 18 &&
        tests.trafficLawTest.passed &&
        tests.manoeuvresTest.passed &&
        tests.drivingTest.passed
      ) {
        setDialog({
          isOpen: true,
          message: 'لا يمكن للمتدرب تحت سن 18 اجتياز اختبار القيادة.',
          type: 'message'
        })
        return
      }

      const updatedClientWithTests = {
        ...updatedClient,
        tests
      }

      await window.api.updateClient(updatedClientWithTests.national_id, updatedClientWithTests)

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.national_id === updatedClient.national_id ? updatedClientWithTests : client
        )
      )

      // Recalculate counts after updating client
      calculateTestCounts(
        clients.map((client) =>
          client.national_id === updatedClient.national_id ? updatedClientWithTests : client
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

  // Handle printing
  const handlePrint = () => {
    setSelectionMode(true)
    // Calculate counts based on current selection
    calculateSelectedCounts(selectedClients)
  }

  // Handle final print action
  const handleFinalPrint = async () => {
    const clientsData = getSelectedClientsNextTests()

    if (clientsData.length === 0) {
      setDialog({
        isOpen: true,
        message: 'لا يوجد متدربين مؤهلين للطباعة.',
        type: 'message'
      })
      return
    }

    try {
      // Generate the Candidates PDF with selected clients' data
      const outputPath = await window.api.generatePDF('candidates', clientsData)

      // Automatically open the generated PDF file
      await window.api.openPath(outputPath)

      // Notify user that the PDF is opened
      setDialog({
        isOpen: true,
        message: 'تم إنشاء الملف وفتح ملف المترشحين.',
        type: 'message'
      })
    } catch (error) {
      if (error.message.includes('EBUSY')) {
        setDialog({
          isOpen: true,
          message: 'الملف مفتوح بالفعل. يرجى إغلاقه والمحاولة مرة أخرى.',
          type: 'message'
        })
      } else {
        console.error('Failed to generate or open PDF:', error)
        setDialog({
          isOpen: true,
          message: 'فشل في إنشاء أو فتح ملف PDF.',
          type: 'message'
        })
      }
    }

    setSelectionMode(false)
    setSelectedClients([])
    setSelectedCounts({
      totalCandidates: 0,
      trafficLawCount: 0,
      manoeuvresCount: 0,
      drivingCount: 0
    })
  }

  // Function to get data for selected clients
  const getSelectedClientsNextTests = () => {
    return selectedClients.map((client) => {
      const nextTest = getNextTestForClient(client)

      return {
        fullName: `${client.first_name_ar || ''} ${client.last_name_ar || ''}`,
        register_number: client.register_number || '', // Updated to match your data structure
        birthDate: client.birth_date || 'غير متوفر',
        nextTest: nextTest
      }
    })
  }

  // Function to determine the next test for a client
  const getNextTestForClient = (client) => {
    const age = calculateAge(client.birth_date)
    if (!client.tests.trafficLawTest.passed) {
      return 'اختبار قانون المرور'
    } else if (!client.tests.manoeuvresTest.passed) {
      return 'اختبار المناورات'
    } else if (!client.tests.drivingTest.passed) {
      if (age >= 18) {
        return 'اختبار القيادة'
      } else {
        return 'غير مؤهل لاختبار القيادة (العمر أقل من 18)'
      }
    } else {
      return 'اجتاز جميع الاختبارات'
    }
  }

  return (
    <div dir="rtl" className="w-screen h-screen flex flex-col overflow-auto bg-gray-100">
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center p-4 sm:p-8 overflow-auto">
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الامتحانات</h1>
          <p className="text-md sm:text-lg text-gray-600 mt-4">
            هنا يمكنك متابعة وإدارة بيانات المتدربين.
          </p>
        </div>

        {/* Display Counts */}
        {!selectionMode && (
          <div className="w-full max-w-5xl mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Candidates */}
              <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">إجمالي عدد المتدربين</h3>
                <p className="text-2xl font-extrabold text-indigo-600">
                  {testCounts.totalCandidates}
                </p>
              </div>

              {/* Traffic Law Candidates */}
              <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  عدد المتدربين في اختبار قانون المرور
                </h3>
                <p className="text-2xl font-extrabold text-blue-600">
                  {testCounts.trafficLawCandidates}
                </p>
              </div>

              {/* Manoeuvres Candidates */}
              <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  عدد المتدربين في اختبار المناورات
                </h3>
                <p className="text-2xl font-extrabold text-green-600">
                  {testCounts.manoeuvresCandidates}
                </p>
              </div>

              {/* Driving Candidates */}
              <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  عدد المتدربين في اختبار القيادة
                </h3>
                <p className="text-2xl font-extrabold text-red-600">
                  {testCounts.drivingCandidates}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters mb-4 w-full max-w-5xl">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ابحث عن المتدربين..."
            className="mb-2 p-2 border rounded-lg w-full"
          />
          <div className="flex justify-between">
            <select
              value={testFilter}
              onChange={handleTestFilterChange}
              className="p-2 border rounded-lg"
            >
              <option value="all">كل الاختبارات</option>
              <option value="trafficLaw">لم يجتز قانون المرور</option>
              <option value="manoeuvres">لم يجتز المناورات</option>
              <option value="driving">لم يجتز القيادة</option>
              <option value="completed">اجتاز جميع الاختبارات</option>
            </select>
            <select
              value={ageFilter}
              onChange={handleAgeFilterChange}
              className="p-2 border rounded-lg"
            >
              <option value="all">كل الأعمار</option>
              <option value="under18">أقل من 18 سنة</option>
              <option value="above18">18 سنة أو أكثر</option>
            </select>
          </div>
        </div>

        <div className="w-full max-w-5xl mb-4">
          {!selectionMode ? (
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full transition duration-300 w-full text-lg font-semibold"
            >
              طباعة ملف المترشحين
            </button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    setSelectionMode(false)
                    setSelectedClients([])
                    setSelectedCounts({
                      totalCandidates: 0,
                      trafficLawCount: 0,
                      manoeuvresCount: 0,
                      drivingCount: 0
                    })
                  }}
                  className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-full transition duration-300 text-lg font-semibold"
                >
                  إلغاء
                </button>
                {selectedClients.length > 0 && (
                  <button
                    onClick={handleFinalPrint}
                    className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 text-lg font-semibold"
                  >
                    تأكيد الطباعة
                  </button>
                )}
              </div>

              {/* Display Selected Counts */}
              <div className="w-full max-w-5xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Selected Candidates */}
                  <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      إجمالي عدد المترشحين
                    </h3>
                    <p className="text-2xl font-extrabold text-indigo-600">
                      {selectedCounts.totalCandidates}
                    </p>
                  </div>

                  {/* Traffic Law Candidates */}
                  <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      عدد المترشحين في اختبار قانون المرور
                    </h3>
                    <p className="text-2xl font-extrabold text-blue-600">
                      {selectedCounts.trafficLawCount}
                    </p>
                  </div>

                  {/* Manoeuvres Candidates */}
                  <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      عدد المترشحين في اختبار المناورات
                    </h3>
                    <p className="text-2xl font-extrabold text-green-600">
                      {selectedCounts.manoeuvresCount}
                    </p>
                  </div>

                  {/* Driving Candidates */}
                  <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      عدد المترشحين في اختبار القيادة
                    </h3>
                    <p className="text-2xl font-extrabold text-red-600">
                      {selectedCounts.drivingCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-4 sm:p-8">
          {loading ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">جاري تحميل البيانات...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">
              لا يوجد متدربين يطابقون البحث.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.national_id}
                  client={client}
                  isSelected={selectedClients.some((c) => c.national_id === client.national_id)}
                  onSelect={handleSelectClient}
                  onEdit={handleEditClient}
                  onArchiveClient={handleArchiveClient} // Pass the function here
                  selectionMode={selectionMode}
                  calculateAge={calculateAge}
                />
              ))}
            </div>
          )}
        </div>
      </main>

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
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default Exams
