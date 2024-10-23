// Exams.jsx

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ClientCard from '../components/Exams/ClientCard'
import EditClientModal from '../components/Exams/EditClientModal'
import ActionDialog from '../components/Messages/ActionDialog'
import Pagination from '../components/Pagination' // If needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

const Exams = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let data = await window.api.readClients()
        // Ensure each client has all necessary properties
        data = data.map((client) => ({
          ...client,
          depositSubmitted: client.depositSubmitted ?? false,
          archived: client.archived ?? false,
          paid: client.paid ?? 0,
          subPrice: client.subPrice ?? 0,
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

        // Include all non-archived clients
        const activeClients = data.filter((client) => !client.archived)
        setClients(activeClients)

        // Calculate counts for each test
        calculateTestCounts(activeClients)
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
  }

  // Update filtered clients whenever filters or search term change
  useEffect(() => {
    let filtered = clients

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((client) =>
        `${client.first_name_ar} ${client.last_name_ar}`.toLowerCase().includes(search)
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
          const isPaidInFull = client.paid >= client.subPrice
          return (
            !client.tests.drivingTest.passed &&
            client.tests.trafficLawTest.passed &&
            client.tests.manoeuvresTest.passed &&
            age >= 18 &&
            isPaidInFull
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

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((client) => {
        const isPaidInFull = client.paid >= client.subPrice
        if (paymentFilter === 'paid') {
          return isPaidInFull
        } else if (paymentFilter === 'notPaid') {
          return !isPaidInFull
        }
        return true
      })
    }

    setFilteredClients(filtered)
  }, [clients, searchTerm, testFilter, ageFilter, paymentFilter])

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

  // Handle printing
  const handlePrint = () => {
    setSelectionMode(true)
  }

  // Handle final print action
  const handleFinalPrint = async () => {
    if (selectedClients.length === 0) {
      setDialog({
        isOpen: true,
        message: 'يرجى تحديد متدرب واحد على الأقل للطباعة.',
        type: 'message'
      })
      return
    }

    const clientsData = getSelectedClientsNextTests()

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
        register_number: client.register_number || '',
        birthDate: client.birth_date || 'غير متوفر',
        nextTest: nextTest
      }
    })
  }

  // Function to determine the next test for a client
  const getNextTestForClient = (client) => {
    const age = calculateAge(client.birth_date)
    const isPaidInFull = client.paid >= client.subPrice
    if (!client.tests.trafficLawTest.passed) {
      return 'اختبار قانون المرور'
    } else if (!client.tests.manoeuvresTest.passed) {
      return 'اختبار المناورات'
    } else if (!client.tests.drivingTest.passed) {
      if (age >= 18) {
        if (isPaidInFull) {
          return 'اختبار القيادة'
        } else {
          return 'غير مؤهل لاختبار القيادة (لم يتم دفع المبلغ كاملاً)'
        }
      } else {
        return 'غير مؤهل لاختبار القيادة (العمر أقل من 18)'
      }
    } else {
      return 'اجتاز جميع الاختبارات'
    }
  }

  // Handle Select All
  const handleSelectAll = () => {
    const clientsToSelect = filteredClients.filter((client) => {
      const age = calculateAge(client.birth_date)
      const isPaidInFull = client.paid >= client.subPrice
      return (
        !selectedClients.some((selected) => selected._id === client._id) &&
        !client.tests.drivingTest.passed &&
        !(
          age < 18 &&
          !client.tests.drivingTest.passed &&
          client.tests.trafficLawTest.passed &&
          client.tests.manoeuvresTest.passed
        ) &&
        !(
          !isPaidInFull &&
          !client.tests.drivingTest.passed &&
          client.tests.trafficLawTest.passed &&
          client.tests.manoeuvresTest.passed
        )
      )
    })

    setSelectedClients(clientsToSelect)
  }

  // Handle Deselect All
  const handleDeselectAll = () => {
    setSelectedClients([])
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ابحث عن المتدربين..."
              className="p-2 border rounded-lg"
            />
            <div className="flex space-x-4">
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
              <select
                value={paymentFilter}
                onChange={handlePaymentFilterChange}
                className="p-2 border rounded-lg"
              >
                <option value="all">كل الحالات</option>
                <option value="paid">مدفوع بالكامل</option>
                <option value="notPaid">لم يتم الدفع بالكامل</option>
              </select>
            </div>
          </div>

          {!selectionMode ? (
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full transition duration-300 w-full text-lg font-semibold"
            >
              طباعة ملف المترشحين
            </button>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={handleSelectAll}
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 mr-2"
                >
                  تحديد الكل
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-full transition duration-300"
                >
                  إلغاء التحديد
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectionMode(false)
                    setSelectedClients([])
                  }}
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-full transition duration-300 mr-2"
                >
                  إلغاء
                </button>
                {selectedClients.length > 0 && (
                  <button
                    onClick={handleFinalPrint}
                    className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-full transition duration-300"
                  >
                    تأكيد الطباعة ({selectedClients.length})
                  </button>
                )}
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
        onCancel={dialog.onCancel}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default Exams
