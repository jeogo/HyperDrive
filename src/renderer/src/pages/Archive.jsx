// Archive.jsx

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ArchiveClientCard from '../components/Archive/ArchiveClientCard'; // Use the special card component
import ActionDialog from '../components/Messages/ActionDialog';
import * as XLSX from 'xlsx';

const Archive = () => {
  const [archivedClients, setArchivedClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: '',
    type: 'message',
    onConfirm: null,
  });
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  useEffect(() => {
    const fetchArchivedClients = async () => {
      try {
        let data = await window.api.readClients();
        data = data.map((client) => ({
          ...client,
          archived: client.archived || false,
          // Ensure other properties exist
        }));

        const archived = data.filter((client) => client.archived);
        setArchivedClients(archived);
        setFilteredClients(archived);
      } catch (error) {
        console.error('Failed to fetch archived clients:', error);
        setDialog({
          isOpen: true,
          message: 'فشل في جلب بيانات الأرشيف.',
          type: 'message',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedClients();
  }, []);

  // Apply filters whenever the filters change
  useEffect(() => {
    applyFilters();
  }, [yearFilter, monthFilter, archivedClients]);

  const applyFilters = () => {
    let filtered = archivedClients;

    if (yearFilter) {
      filtered = filtered.filter((client) => {
        const clientYear = new Date(client.register_date).getFullYear();
        return clientYear === parseInt(yearFilter);
      });
    }

    if (monthFilter) {
      filtered = filtered.filter((client) => {
        const clientMonth = new Date(client.register_date).getMonth() + 1;
        return clientMonth === parseInt(monthFilter);
      });
    }

    setFilteredClients(filtered);
  };

  // Calculate age function
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }
    return age;
  };

  // Unarchive client function
  const handleUnarchiveClient = async (client) => {
    try {
      const updatedClient = { ...client, archived: false };
      await window.api.updateClient(updatedClient.national_id, updatedClient);

      setArchivedClients((prevClients) =>
        prevClients.filter((c) => c.national_id !== client.national_id)
      );

      setDialog({
        isOpen: true,
        message: `تم إلغاء أرشفة المتدرب ${client.first_name_ar} ${client.last_name_ar}.`,
        type: 'message',
      });
    } catch (error) {
      console.error('Failed to unarchive client:', error);
      setDialog({
        isOpen: true,
        message: 'فشل في إلغاء أرشفة المتدرب.',
        type: 'message',
      });
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      setDialog({
        isOpen: true,
        message: 'لا توجد بيانات للتصدير.',
        type: 'message',
      });
      return;
    }

    const excelData = filteredClients.map((client) => ({
      'الاسم الكامل': `${client.first_name_ar} ${client.last_name_ar}`,
      'رقم الهاتف': client.phone_number,
      'تاريخ الميلاد': client.birth_date,
      'العمر': calculateAge(client.birth_date),
      'رقم التسجيل': client.register_number || 'غير متوفر',
      'تاريخ التسجيل': client.register_date || 'غير متوفر',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الأرشيف');
    XLSX.writeFile(workbook, 'الأرشيف.xlsx');
  };

  return (
    <div
      dir="rtl"
      className="w-screen h-screen flex flex-col overflow-auto bg-gray-100"
    >
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center p-4 sm:p-8 overflow-auto">
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            الأرشيف
          </h1>
          <p className="text-md sm:text-lg text-gray-600 mt-4">
            هنا يمكنك عرض المتدربين المؤرشفين.
          </p>
        </div>

        {/* Filter Section */}
        <div className="w-full max-w-5xl mb-4 flex flex-col sm:flex-row gap-4">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر السنة</option>
            {getUniqueYears(archivedClients).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر الشهر</option>
            {getMonthOptions().map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          {/* Export to Excel Button */}
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-full transition duration-300 flex items-center"
          >
            تصدير إلى Excel
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-4 sm:p-8">
          {loading ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">
              جاري تحميل البيانات...
            </p>
          ) : filteredClients.length === 0 ? (
            <p className="text-lg sm:text-xl text-gray-700 text-center">
              لا يوجد متدربين في الأرشيف.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredClients.map((client) => (
                <ArchiveClientCard
                  key={client.national_id}
                  client={client}
                  onUnarchiveClient={handleUnarchiveClient}
                  calculateAge={calculateAge}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <ActionDialog
        isOpen={dialog.isOpen}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  );
};

// Helper function to get unique years from the clients' register dates
const getUniqueYears = (clients) => {
  const years = clients.map((client) =>
    new Date(client.register_date).getFullYear()
  );
  return Array.from(new Set(years));
};

// Helper function to get month options
const getMonthOptions = () => {
  return [
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'مايو' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليو' },
    { value: '8', label: 'أغسطس' },
    { value: '9', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' },
  ];
};

export default Archive;
