// Payment.jsx

import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { SearchIcon } from '@heroicons/react/outline'

const Payment = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all', 'paid', 'unpaid', 'partial'

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await window.api.readClients()

        // Filter out archived clients
        const activeClients = clientsData.filter((client) => !client.archived)

        setClients(activeClients)
        setFilteredClients(activeClients)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setError('فشل في تحميل بيانات العملاء. حاول مرة أخرى.')
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Apply filters whenever clients, searchTerm, or paymentFilter changes
  useEffect(() => {
    let filtered = clients

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          client.first_name_ar.toLowerCase().includes(search) ||
          client.last_name_ar.toLowerCase().includes(search) ||
          client.national_id?.includes(search) ||
          client.phone_number?.includes(search)
      )
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((client) => {
        const subPrice = client.subPrice || 0
        const paid = client.paid || 0
        const remaining = subPrice - paid

        if (paymentFilter === 'paid') {
          return remaining <= 0
        } else if (paymentFilter === 'unpaid') {
          return paid === 0 && subPrice > 0
        } else if (paymentFilter === 'partial') {
          return paid > 0 && remaining > 0
        }

        return true
      })
    }

    setFilteredClients(filtered)
  }, [clients, searchTerm, paymentFilter])

  // Calculate totals based on filtered clients
  const totalPaid = filteredClients.reduce((sum, client) => sum + (client.paid || 0), 0)
  const totalUnpaid = filteredClients.reduce(
    (sum, client) => sum + Math.max((client.subPrice || 0) - (client.paid || 0), 0),
    0
  )
  const totalClients = filteredClients.length // Total number of filtered clients

  return (
    <div dir="rtl" className="w-screen h-screen flex flex-col">
      <Navbar />

      {/* Page Title */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-8">
        <div className="px-4">
          <h1 className="text-4xl font-extrabold text-center">لوحة التحكم المالية</h1>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          {/* Search Input */}
          <div className="relative mb-4 md:mb-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن العميل (الاسم، رقم التعريف الوطني، أو رقم الهاتف)..."
              className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-lg"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-6 lg:w-6" />
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center space-x-4">
            <label htmlFor="paymentFilter" className="text-gray-700 font-semibold">
              تصفية حسب حالة الدفع:
            </label>
            <select
              id="paymentFilter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">الكل</option>
              <option value="paid">مدفوع</option>
              <option value="unpaid">غير مدفوع</option>
              <option value="partial">مدفوع جزئياً</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">إجمالي عدد العملاء</h2>
            <p className="text-4xl font-extrabold text-blue-600">{totalClients}</p>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">إجمالي المبلغ المدفوع</h2>
            <p className="text-4xl font-extrabold text-green-600">
              {totalPaid.toLocaleString()} د.ج
            </p>
          </div>

          {/* Total Unpaid */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">إجمالي المبلغ غير المدفوع</h2>
            <p className="text-4xl font-extrabold text-red-600">
              {totalUnpaid.toLocaleString()} د.ج
            </p>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-3xl shadow-lg">
          <h2 className="text-2xl font-extrabold text-gray-800 p-6 border-b">قائمة العملاء</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center text-xl font-semibold text-gray-600 p-8">
                جاري تحميل البيانات...
              </div>
            ) : error ? (
              <div className="text-center text-xl font-semibold text-red-600 p-8">{error}</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center text-xl font-semibold text-gray-600 p-8">
                لا توجد بيانات للعرض
              </div>
            ) : (
              <table className="min-w-full text-right">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      الاسم و اللقب
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      رقم التعريف الوطني
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      المبلغ المدفوع
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      المبلغ المتبقي
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                        {client.first_name_ar} {client.last_name_ar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-600">
                        {client.national_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-600 font-semibold">
                        {(client.paid || 0).toLocaleString()} د.ج
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-red-600 font-semibold">
                        {Math.max((client.subPrice || 0) - (client.paid || 0), 0).toLocaleString()}{' '}
                        د.ج
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Payment
