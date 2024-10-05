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
  const [ageFilter, setAgeFilter] = useState('all') // 'all', 'under19', 'above19'

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
        // Ensure each client has all test properties
        data = data.map((client) => ({
          ...client,
          depositSubmitted: client.depositSubmitted || false,
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

        const filteredClients = data.filter((client) => client.depositSubmitted === true)
        setClients(filteredClients)
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
          return !client.tests.manoeuvresTest.passed
        } else if (testFilter === 'driving') {
          return !client.tests.drivingTest.passed
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
        if (ageFilter === 'under19') {
          return age < 19
        } else if (ageFilter === 'above19') {
          return age >= 19
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

    // Prevent selection if the client is under 19 and the next test is driving test
    if (age < 19 && !client.tests.drivingTest.passed && isEligibleForDrivingTest) {
      setDialog({
        isOpen: true,
        message: `لا يمكن تحديد المتدرب ${client.first_name_ar} ${client.last_name_ar} لأنه أقل من 19 عامًا ولا يمكنه اجتياز اختبار القيادة.`,
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
      if (prevSelected.find((c) => c.national_id === client.national_id)) {
        // Deselect the client
        return prevSelected.filter((c) => c.national_id !== client.national_id)
      } else {
        // Select the client
        return [...prevSelected, client]
      }
    })
  }

  // Handle edit button click
  const handleEditClient = (client) => {
    setCurrentClient(client)
    setIsModalOpen(true)
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
        age < 19 &&
        tests.trafficLawTest.passed &&
        tests.manoeuvresTest.passed &&
        tests.drivingTest.passed
      ) {
        setDialog({
          isOpen: true,
          message: 'لا يمكن للمتدرب تحت سن 19 اجتياز اختبار القيادة.',
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
      if (age >= 19) {
        return 'اختبار القيادة'
      } else {
        return 'غير مؤهل لاختبار القيادة (العمر أقل من 19)'
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
              <option value="under19">أقل من 19 سنة</option>
              <option value="above19">19 سنة أو أكثر</option>
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
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  setSelectionMode(false)
                  setSelectedClients([])
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
