// Enhanced error messages in Arabic for better user experience
export const ERROR_MESSAGES = {
  // Document generation errors
  TRAFFIC_LAW_REQUIRED: {
    title: 'لا يمكن إنشاء الوثيقة',
    message: 'يجب على المتدرب اجتياز اختبار قانون المرور أولاً',
    action: 'انتقل إلى صفحة الامتحانات لتسجيل النتيجة'
  },

  PAYMENT_REQUIRED: {
    title: 'الدفع غير مكتمل',
    message: 'يجب إكمال دفع جميع المستحقات قبل اجتياز امتحان القيادة',
    action: 'انتقل إلى صفحة الدفع لإكمال المستحقات'
  },

  FOLLOW_UP_FILE_RESTRICTED: {
    title: 'لا يمكن إنشاء ملف المتابعة',
    message: 'يجب على الطالب اجتياز اختبار قانون المرور في مدرسة القيادة أولاً',
    action: 'تأكد من اجتياز اختبار قانون المرور قبل إنشاء ملف المتابعة'
  },

  AGE_REQUIREMENT: {
    title: 'متطلب العمر غير مكتمل',
    message: 'يجب أن يكون عمر المتدرب 18 سنة على الأقل',
    action: 'تحقق من تاريخ الميلاد في بيانات المتدرب'
  },

  PRACTICAL_TEST_REQUIRED: {
    title: 'اختبار عملي مطلوب',
    message: 'يجب اجتياز الاختبار العملي قبل إنتاج هذه الوثيقة',
    action: 'سجل نتيجة الاختبار العملي أولاً'
  },

  MISSING_DATA: {
    title: 'بيانات ناقصة',
    message: 'بعض البيانات المطلوبة غير مكتملة',
    action: 'راجع وأكمل بيانات المتدرب'
  },

  // Test eligibility errors
  TEST_SEQUENCE_ERROR: {
    title: 'ترتيب الاختبارات خطأ',
    message: 'يجب اجتياز الاختبارات بالترتيب المطلوب',
    action: 'ابدأ باختبار قانون المرور أولاً'
  },

  UNDER_AGE_TEST: {
    title: 'العمر غير مؤهل',
    message: 'المتدرب أقل من 18 سنة ولا يمكنه دخول الاختبارات',
    action: 'انتظر حتى يبلغ المتدرب 18 سنة'
  },

  EXAM_ALREADY_PASSED: {
    title: 'اختبار مكتمل',
    message: 'المتدرب اجتاز هذا الاختبار مسبقاً',
    action: 'يمكن المتابعة للاختبار التالي'
  },

  // Client management errors
  CLIENT_NOT_FOUND: {
    title: 'متدرب غير موجود',
    message: 'لم يتم العثور على بيانات المتدرب المطلوب',
    action: 'تحقق من رقم التسجيل أو ابحث مرة أخرى'
  },

  DUPLICATE_REGISTRATION: {
    title: 'تسجيل مكرر',
    message: 'توجد بيانات مشابهة لمتدرب آخر',
    action: 'تحقق من رقم الهوية ورقم الهاتف'
  },

  // General success messages
  SUCCESS_DOCUMENT: {
    title: 'تم بنجاح',
    message: 'تم إنتاج الوثيقة بنجاح',
    action: 'يمكن طباعة الوثيقة الآن'
  },

  SUCCESS_TEST: {
    title: 'تم التسجيل',
    message: 'تم تسجيل نتيجة الاختبار بنجاح',
    action: 'يمكن المتابعة للمرحلة التالية'
  },

  SUCCESS_UPDATE: {
    title: 'تم التحديث',
    message: 'تم تحديث البيانات بنجاح',
    action: 'البيانات محفوظة في النظام'
  }
}

// Function to get error message by key
export const getErrorMessage = (errorKey, customMessage = null) => {
  const error = ERROR_MESSAGES[errorKey]
  if (!error) {
    return {
      title: 'خطأ غير معروف',
      message: customMessage || 'حدث خطأ غير متوقع',
      action: 'حاول مرة أخرى أو اتصل بالدعم الفني'
    }
  }

  return {
    ...error,
    message: customMessage || error.message
  }
}

// Function to check document eligibility
export const checkDocumentEligibility = (client, documentType) => {
  if (!client) {
    return { eligible: false, error: 'MISSING_DATA' }
  }

  const age = calculateAge(client.birth_date)
  const trafficLawPassed = client.tests?.trafficLawTest?.passed || false
  const practicalPassed = client.tests?.manoeuvresTest?.passed || false

  // Helper to build success object with reason (for better UX if needed later)
  const success = (reason = '') => ({ eligible: true, reason })

  switch (documentType) {
    case 'medicalCertificate':
      return success('وثيقة طبية لا تتطلب اجتياز اختبار')
    case 'formTemplate':
      return success('نموذج استمارة متاح دائماً')

    case 'trafficLawLessonsCard':
      if (age < 18) {
        return { eligible: false, error: 'AGE_REQUIREMENT' }
      }
      return success('العمر مستوفٍ ويمكن إصدار بطاقة حصص القانون')

    case 'candidateFollowUpCard': {
      if (!trafficLawPassed) {
        return { eligible: false, error: 'FOLLOW_UP_FILE_RESTRICTED' }
      }
      return success('تم اجتياز قانون المرور ويمكن إصدار بطاقة المتابعة')
    }
    case 'followUpFile': {
      // Explicit separation in case future conditions (like payment) are added
      if (!trafficLawPassed) {
        return { eligible: false, error: 'FOLLOW_UP_FILE_RESTRICTED' }
      }
      return success('تم اجتياز قانون المرور ويمكن إنشاء ملف المتابعة')
    }

    case 'preparationCard':
      if (!practicalPassed) {
        return { eligible: false, error: 'PRACTICAL_TEST_REQUIRED' }
      }
      return success('تم اجتياز المناورات ويمكن إنشاء بطاقة الإعداد')

    default:
      return { eligible: false, error: 'MISSING_DATA' }
  }
}

// Function to check test eligibility
export const checkTestEligibility = (client, testType) => {
  if (!client) {
    return { eligible: false, error: 'CLIENT_NOT_FOUND' }
  }

  const age = calculateAge(client.birth_date)
  const trafficLawPassed = client.tests?.trafficLawTest?.passed || false
  const practicalPassed = client.tests?.manoeuvresTest?.passed || false
  const finalPassed = client.tests?.drivingTest?.passed || false

  switch (testType) {
    case 'trafficLawTest':
      if (age < 18) {
        return { eligible: false, error: 'UNDER_AGE_TEST' }
      }
      if (trafficLawPassed) {
        return { eligible: false, error: 'EXAM_ALREADY_PASSED' }
      }
      return { eligible: true }

    case 'manoeuvresTest':
      if (age < 18) {
        return { eligible: false, error: 'UNDER_AGE_TEST' }
      }
      if (!trafficLawPassed) {
        return { eligible: false, error: 'TRAFFIC_LAW_REQUIRED' }
      }
      if (practicalPassed) {
        return { eligible: false, error: 'EXAM_ALREADY_PASSED' }
      }
      return { eligible: true }

    case 'drivingTest': {
      if (age < 18) {
        return { eligible: false, error: 'UNDER_AGE_TEST' }
      }
      if (!trafficLawPassed) {
        return { eligible: false, error: 'TRAFFIC_LAW_REQUIRED' }
      }
      if (!practicalPassed) {
        return { eligible: false, error: 'PRACTICAL_TEST_REQUIRED' }
      }

      // Check payment completion for driving test
      const totalAmount = parseFloat(client.subPrice || 0)
      const paidAmount = parseFloat(client.paid || 0)
      const isPaymentComplete = totalAmount > 0 ? paidAmount >= totalAmount : true

      if (!isPaymentComplete) {
        return { eligible: false, error: 'PAYMENT_REQUIRED' }
      }

      if (finalPassed) {
        return { eligible: false, error: 'EXAM_ALREADY_PASSED' }
      }
      return { eligible: true }
    }

    default:
      return { eligible: false, error: 'MISSING_DATA' }
  }
}

// Helper function to calculate age
const calculateAge = (birthDate) => {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
