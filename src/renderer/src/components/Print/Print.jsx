import { useState } from 'react'
import { PrinterIcon } from '@heroicons/react/outline'
import { ActionDialog } from '../../components'

const Print = ({ client }) => {
  const [dialogProps, setDialogProps] = useState({
    isOpen: false,
    type: 'message',
    message: '',
    onClose: null
  })

  const handlePrintDocument = async (templateName) => {
    try {
      const outputPath = await window.api.generatePDF(templateName, client)

      // Success: Log the output path and show success message
      console.log('Generated PDF Path:', outputPath)

      // Open the generated PDF file using the default system PDF viewer
      if (outputPath) {
        const result = await window.api.openPath(outputPath)
        if (result) {
          showError('فشل في فتح ملف الـPDF. يرجى إغلاق أي ملفات PDF مفتوحة وحاول مرة أخرى.')
        } else {
          showSuccess('تم توليد ملف PDF بنجاح وفتح الملف.')
        }
      } else {
        showError('ملف ال pdf مفتوح الرجاء اغلاقه و المحاولة مرة اخرى')
      }
    } catch (error) {
      showError(
        'حدث خطأ أثناء توليد أو فتح ملف الـPDF. يرجى إغلاق أي ملفات PDF مفتوحة والمحاولة مرة أخرى.'
      )
    }
  }

  // Function to show error dialog in Arabic
  const showError = (message) => {
    setDialogProps({
      isOpen: true,
      type: 'error',
      message,
      onClose: closeDialog
    })
  }

  // Function to show success dialog in Arabic
  const showSuccess = (message) => {
    setDialogProps({
      isOpen: true,
      type: 'success',
      message,
      onClose: closeDialog
    })
  }

  const closeDialog = () => {
    setDialogProps((prevProps) => ({
      ...prevProps,
      isOpen: false
    }))
  }

  if (!client) {
    return (
      <div className="w-full h-full p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl shadow-lg flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">لا توجد معلومات لعرضها</h2>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl shadow-lg flex flex-col items-center">
      <div className="mb-8 p-6 bg-white rounded-3xl shadow-md flex flex-col items-center w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {client?.last_name_ar} - {client?.first_name_ar}
        </h3>
        <p className="text-lg text-gray-600 mb-2">
          <span className="font-medium">رقم الهاتف: </span>
          {client?.phone_number}
        </p>
        <p className="text-lg text-gray-600">
          <span className="font-medium">تاريخ الميلاد: </span>
          {client?.birth_date || 'غير متوفر'}
        </p>
      </div>

      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">معاينة الطباعة</h2>

      <div className="w-full max-w-md grid grid-cols-1 gap-6">
        <button
          className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-3xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none"
          onClick={() => handlePrintDocument('formTemplate')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة نموذج الاستمارة
        </button>
        <button
          className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-3xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none"
          onClick={() => handlePrintDocument('followUpFile')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة ملف المتابعة
        </button>
        <button
          className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-3xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none"
          onClick={() => handlePrintDocument('trafficLawLessonsCard')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة بطاقة خاصة بدروس قانون المرور
        </button>
        <button
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none"
          onClick={() => handlePrintDocument('preparationCard')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة بطاقة الإعداد لامتحان المناورات
        </button>
        {/* New button for Medical Certificate */}
        <button
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none"
          onClick={() => handlePrintDocument('medicalCertificate')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة الشهادة الطبية
        </button>
      </div>

      {/* Error or success dialog */}
      <ActionDialog
        isOpen={dialogProps.isOpen}
        type={dialogProps.type}
        message={dialogProps.message}
        onClose={dialogProps.onClose}
      />
    </div>
  )
}

export default Print
