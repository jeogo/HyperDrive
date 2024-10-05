import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const Payment = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await window.api.readClients();
        setClients(clientsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setError('فشل في تحميل بيانات العملاء. حاول مرة أخرى.');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const totalPaid = clients.reduce((sum, client) => sum + client.paid, 0);
  const totalUnpaid = clients.reduce(
    (sum, client) => sum + (client.subPrice - client.paid),
    0
  );
  const totalClients = clients.length; // Total number of clients

  return (
    <div dir="rtl" className="w-screen h-screen flex flex-col">
      <Navbar />

      {/* Page Title */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-8">
        <div className="px-4">
          <h1 className="text-4xl font-extrabold text-center">
            لوحة التحكم المالية
          </h1>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              إجمالي عدد العملاء
            </h2>
            <p className="text-4xl font-extrabold text-blue-600">
              {totalClients}
            </p>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              إجمالي المبلغ المدفوع
            </h2>
            <p className="text-4xl font-extrabold text-green-600">
              {totalPaid.toLocaleString()} د.ج
            </p>
          </div>

          {/* Total Unpaid */}
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              إجمالي المبلغ غير المدفوع
            </h2>
            <p className="text-4xl font-extrabold text-red-600">
              {totalUnpaid.toLocaleString()} د.ج
            </p>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-3xl shadow-lg">
          <h2 className="text-2xl font-extrabold text-gray-800 p-6 border-b">
            قائمة العملاء
          </h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center text-xl font-semibold text-gray-600 p-8">
                جاري تحميل البيانات...
              </div>
            ) : error ? (
              <div className="text-center text-xl font-semibold text-red-600 p-8">
                {error}
              </div>
            ) : clients.length === 0 ? (
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
                  {clients.map((client) => (
                    <tr key={client.national_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                        {client.first_name_ar} {client.last_name_ar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-600">
                        {client.national_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-600 font-semibold">
                        {client.paid.toLocaleString()} د.ج
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-red-600 font-semibold">
                        {(client.subPrice - client.paid).toLocaleString()} د.ج
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
  );
};

export default Payment;
