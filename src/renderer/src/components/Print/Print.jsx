import React, { useState, useCallback } from 'react'
import { PrinterIcon } from '@heroicons/react/outline'
import { ActionDialog } from '../../components'
import { checkDocumentEligibility, getErrorMessage } from '../../utils/errorMessages'

const Print = ({ client }) => {
  const [dialogProps, setDialogProps] = useState({
    isOpen: false,
    type: 'message',
    message: '',
    onClose: null
  })

  const handlePrintDocument = useCallback(async (templateName) => {
    try {
      // Debug: Log client structure for testing
      console.log('🔍 Debug - Client object:', client)
      console.log('🔍 Debug - Template name:', templateName)
      console.log('🔍 Debug - Client tests:', client?.tests)
      console.log('🔍 Debug - Traffic law passed:', client?.tests?.trafficLawTest?.passed)

      // Check document eligibility first
      const eligibilityCheck = checkDocumentEligibility(client, templateName)
      console.log('🔍 Debug - Eligibility check result:', eligibilityCheck)

      if (!eligibilityCheck.eligible) {
        const errorMsg = getErrorMessage(eligibilityCheck.error)
        console.log('🚫 BLOCKED - Document creation prevented:', errorMsg)
        showError(`${errorMsg.title}: ${errorMsg.message}`)
        return
      }

      console.log('✅ ALLOWED - Document creation proceeding...')
      let outputPath

      // Special handling for traffic law lessons card
      if (templateName === 'trafficLawLessonsCard') {
        // Format dates properly for Arabic display
        const formatDateForArabic = (dateStr) => {
          if (!dateStr) return ''
          const date = new Date(dateStr)
          return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
        }

        // Convert client data to format expected by Python script
        const data = {
          schoolName: 'مدرسة تعليم السياقة', // You can make this configurable later
          fullName: `${client?.first_name_ar || ''} ${client?.last_name_ar || ''}`.trim(),
          birthDate: formatDateForArabic(client?.birth_date),
          birthPlace: client?.birth_place || '',
          address: (() => {
            const addressParts = [
              client?.current_address,
              client?.current_municipality,
              client?.current_state
            ]
              .filter(Boolean)
              .filter((part, index, arr) => arr.indexOf(part) === index) // Remove duplicates
            return addressParts.join('، ') || 'العنوان غير متوفر'
          })(),
          registrationDate:
            formatDateForArabic(client?.register_date) || formatDateForArabic(new Date())
        }

        // Generate start date (today + 1 day for example)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const startDate = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD format

        const result = await window.api.fillTrafficLawLessonsCard({
          startDate,
          data,
          sessions: 30,
          hasHeader: true, // Skip first row since it's the title/header
          pdfOnly: true // Generate PDF only for print functionality
        })

        outputPath = result.outputPath
      }
      // Special handling for candidate follow-up card
      else if (templateName === 'candidateFollowUpCard') {
        // Check traffic law test status for UI feedback
        const trafficLawPassed = client?.tests?.trafficLawTest?.passed || false
        const lawTestDate = client?.tests?.trafficLawTest?.lastAttemptDate

        // Prepare complete client data including test information
        const clientData = {
          _id: client?._id || '',
          first_name_ar: client?.first_name_ar || '',
          last_name_ar: client?.last_name_ar || '',
          birth_date: client?.birth_date || '',
          birth_municipality: client?.birth_municipality || '',
          birth_state: client?.birth_state || '',
          current_address: client?.current_address || '',
          current_municipality: client?.current_municipality || '',
          current_state: client?.current_state || '',
          phone_number: client?.phone_number || '',
          register_date: client?.register_date || '',
          subPrice: client?.subPrice || 6000,
          tests: client?.tests || {}
        }

        // Smart date calculation:
        // - If traffic law passed: start day after test date
        // - If not passed: use registration date or today
        let startDate
        if (trafficLawPassed && lawTestDate) {
          const testDate = new Date(lawTestDate)
          testDate.setDate(testDate.getDate() + 1)
          startDate = testDate.toISOString().split('T')[0]
          console.log(`✅ Using smart date calculation - lessons start ${startDate}`)
        } else {
          const fallbackDate = client?.register_date || new Date().toISOString().split('T')[0]
          startDate = fallbackDate
          console.log(`⏳ Using template generation - start date ${startDate}`)
        }

        const result = await window.api.fillCandidateFollowUpCard({
          startDate,
          clientData,
          table1Dates: 30, // First lessons table
          table2Dates: 30, // Second lessons table
          pdfOnly: true // Generate PDF only for print functionality
        })

        outputPath = result.outputPath
      } else {
        // Use regular PDF generation for other templates
        outputPath = await window.api.generatePDF(templateName, client)
      }

      // Success: Log the output path and show success message
      console.log('Generated PDF Path:', outputPath)

      // Open the generated PDF file using the default system PDF viewer
      if (outputPath) {
        const result = await window.api.openPath(outputPath)
        if (result) {
          showError('فشل في فتح ملف الـPDF. يرجى إغلاق أي ملفات PDF مفتوحة وحاول مرة أخرى.')
        } else {
          const successMsg = getErrorMessage('SUCCESS_DOCUMENT')
          showSuccess(`${successMsg.title}: تم إنتاج الوثيقة وفتحها بنجاح`)
        }
      } else {
        showError('ملف الـ PDF مفتوح. الرجاء إغلاقه والمحاولة مرة أخرى')
      }
    } catch (error) {
      const errorMsg = getErrorMessage('MISSING_DATA', 'حدث خطأ أثناء إنتاج الوثيقة')
      showError(`${errorMsg.title}: ${errorMsg.message}`)
    }
  }, [client])

  // Function to show error dialog in Arabic
  const showError = useCallback((message) => {
    setDialogProps({
      isOpen: true,
      type: 'error',
      message,
      onClose: closeDialog
    })
  }, [])

  // Function to show success dialog in Arabic
  const showSuccess = useCallback((message) => {
    setDialogProps({
      isOpen: true,
      type: 'success',
      message,
      onClose: closeDialog
    })
  }, [])

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

      <div className="w-full max-w-md grid grid-cols-1 gap-4">
        {/* 1. نموذج الاستمارة - Form Template */}
        <button
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => handlePrintDocument('formTemplate')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة نموذج الاستمارة
        </button>

        {/* 2. الشهادة الطبية - Medical Certificate */}
        <button
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-300"
          onClick={() => handlePrintDocument('medicalCertificate')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة الشهادة الطبية
        </button>

        {/* 3. بطاقة الإعداد لامتحان المناورات - Preparation Card */}
        <button
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300"
          onClick={() => handlePrintDocument('preparationCard')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة بطاقة الإعداد لامتحان المناورات
        </button>

        {/* 4. بطاقة دروس قانون المرور - Traffic Law Lessons Card */}
        <button
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => handlePrintDocument('trafficLawLessonsCard')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة بطاقة خاصة بدروس قانون المرور
        </button>

        {/* 5. ملف المتابعة - Follow Up File */}
        <button
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={() => handlePrintDocument('followUpFile')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          طباعة ملف المتابعة
        </button>

        {/* بطاقة المتابعة للمترشح - Candidate Follow Up Card */}
        <button
          className={`w-full py-4 rounded-3xl shadow-md hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${
            client?.tests?.trafficLawTest?.passed
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white focus:ring-green-300'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white focus:ring-indigo-300'
          }`}
          onClick={() => handlePrintDocument('candidateFollowUpCard')}
        >
          <PrinterIcon className="inline h-6 w-6 mr-2" />
          {client?.tests?.trafficLawTest?.passed
            ? '✅ طباعة بطاقة المتابعة للمترشح (ذكي)'
            : '⏳ طباعة بطاقة المتابعة للمترشح (قالب)'
          }
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

export default React.memo(Print)
