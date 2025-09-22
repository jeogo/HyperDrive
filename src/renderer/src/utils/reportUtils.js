// Reporting and analytics utilities
// Generates insights and statistics for the driving school

import { calculateAge } from './clientUtils'
import { getClientWorkflowStatus, getClientTestStatistics } from './testUtils'

// Generate comprehensive client report
export const generateClientReport = (clients) => {
  if (!clients?.length) return null

  const report = {
    overview: {
      totalClients: clients.length,
      activeClients: clients.filter((c) => !c.archived).length,
      archivedClients: clients.filter((c) => c.archived).length
    },
    demographics: {
      ageGroups: {
        under18: 0,
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        over50: 0
      },
      genderDistribution: {
        male: 0,
        female: 0,
        unspecified: 0
      },
      locations: {}
    },
    workflow: {
      underage: 0,
      'ready-for-theory': 0,
      'ready-for-practical': 0,
      'ready-for-final': 0,
      completed: 0
    },
    tests: {
      trafficLaw: { total: 0, passed: 0, failed: 0, attempts: 0 },
      maneuvers: { total: 0, passed: 0, failed: 0, attempts: 0 },
      driving: { total: 0, passed: 0, failed: 0, attempts: 0 }
    },
    financial: {
      totalRevenue: 0,
      paidClients: 0,
      unpaidClients: 0,
      averagePayment: 0
    },
    performance: {
      passRates: {},
      averageAttempts: {},
      completionRate: 0
    }
  }

  // Process each client
  clients.forEach((client) => {
    const age = calculateAge(client.birth_date)
    const status = getClientWorkflowStatus(client)
    const testStats = getClientTestStatistics(client)

    // Age demographics
    if (age < 18) report.demographics.ageGroups.under18++
    else if (age <= 25) report.demographics.ageGroups['18-25']++
    else if (age <= 35) report.demographics.ageGroups['26-35']++
    else if (age <= 50) report.demographics.ageGroups['36-50']++
    else report.demographics.ageGroups.over50++

    // Gender demographics
    if (client.gender === 'male') report.demographics.genderDistribution.male++
    else if (client.gender === 'female') report.demographics.genderDistribution.female++
    else report.demographics.genderDistribution.unspecified++

    // Location demographics
    const municipality = client.current_municipality || 'غير محدد'
    report.demographics.locations[municipality] =
      (report.demographics.locations[municipality] || 0) + 1

    // Workflow status
    report.workflow[status] = (report.workflow[status] || 0) + 1

    // Test statistics
    const tests = client.tests || {}

    // Traffic law test
    if (tests.trafficLawTest) {
      report.tests.trafficLaw.total++
      report.tests.trafficLaw.attempts += tests.trafficLawTest.attempts || 0
      if (tests.trafficLawTest.passed) {
        report.tests.trafficLaw.passed++
      } else if (tests.trafficLawTest.attempts > 0) {
        report.tests.trafficLaw.failed++
      }
    }

    // Maneuvers test
    if (tests.manoeuvresTest) {
      report.tests.maneuvers.total++
      report.tests.maneuvers.attempts += tests.manoeuvresTest.attempts || 0
      if (tests.manoeuvresTest.passed) {
        report.tests.maneuvers.passed++
      } else if (tests.manoeuvresTest.attempts > 0) {
        report.tests.maneuvers.failed++
      }
    }

    // Driving test
    if (tests.drivingTest) {
      report.tests.driving.total++
      report.tests.driving.attempts += tests.drivingTest.attempts || 0
      if (tests.drivingTest.passed) {
        report.tests.driving.passed++
      } else if (tests.drivingTest.attempts > 0) {
        report.tests.driving.failed++
      }
    }

    // Financial data
    const payment = parseFloat(client.paid) || 0
    if (payment > 0) {
      report.financial.totalRevenue += payment
      report.financial.paidClients++
    } else {
      report.financial.unpaidClients++
    }
  })

  // Calculate performance metrics
  Object.keys(report.tests).forEach((testType) => {
    const test = report.tests[testType]
    if (test.total > 0) {
      report.performance.passRates[testType] = Math.round((test.passed / test.total) * 100)
      report.performance.averageAttempts[testType] =
        Math.round((test.attempts / test.total) * 10) / 10
    }
  })

  // Overall completion rate
  const completedClients = report.workflow.completed || 0
  report.performance.completionRate = Math.round(
    (completedClients / report.overview.totalClients) * 100
  )

  // Average payment
  if (report.financial.paidClients > 0) {
    report.financial.averagePayment = Math.round(
      report.financial.totalRevenue / report.financial.paidClients
    )
  }

  return report
}

// Generate monthly statistics
export const generateMonthlyStats = (clients, year = new Date().getFullYear()) => {
  const monthlyStats = {}

  for (let month = 1; month <= 12; month++) {
    monthlyStats[month] = {
      registrations: 0,
      completions: 0,
      revenue: 0,
      tests: {
        trafficLaw: 0,
        maneuvers: 0,
        driving: 0
      }
    }
  }

  clients.forEach((client) => {
    // Registration month
    const registerDate = new Date(client.createdAt || client.register_date)
    if (registerDate.getFullYear() === year) {
      const month = registerDate.getMonth() + 1
      monthlyStats[month].registrations++

      const payment = parseFloat(client.paid) || 0
      monthlyStats[month].revenue += payment
    }

    // Test completion months
    const tests = client.tests || {}
    Object.keys(tests).forEach((testType) => {
      const test = tests[testType]
      if (test?.lastAttemptDate && test.passed) {
        const testDate = new Date(test.lastAttemptDate)
        if (testDate.getFullYear() === year) {
          const month = testDate.getMonth() + 1

          switch (testType) {
            case 'trafficLawTest':
              monthlyStats[month].tests.trafficLaw++
              break
            case 'manoeuvresTest':
              monthlyStats[month].tests.maneuvers++
              break
            case 'drivingTest':
              monthlyStats[month].tests.driving++
              monthlyStats[month].completions++
              break
          }
        }
      }
    })
  })

  return monthlyStats
}

// Generate test performance analysis
export const analyzeTestPerformance = (clients) => {
  const analysis = {
    testTypes: {
      trafficLawTest: { attempts: [], passRates: [] },
      manoeuvresTest: { attempts: [], passRates: [] },
      drivingTest: { attempts: [], passRates: [] }
    },
    trends: {
      monthlyPassRates: {},
      attemptDistribution: {},
      retryAnalysis: {}
    },
    insights: []
  }

  clients.forEach((client) => {
    const tests = client.tests || {}

    Object.keys(tests).forEach((testType) => {
      const test = tests[testType]
      if (test && test.attempts > 0) {
        analysis.testTypes[testType].attempts.push(test.attempts)

        // Track pass rate (1 for passed, 0 for not passed)
        analysis.testTypes[testType].passRates.push(test.passed ? 1 : 0)
      }
    })
  })

  // Calculate statistics for each test type
  Object.keys(analysis.testTypes).forEach((testType) => {
    const data = analysis.testTypes[testType]

    if (data.attempts.length > 0) {
      const avgAttempts = data.attempts.reduce((a, b) => a + b, 0) / data.attempts.length
      const passRate = data.passRates.reduce((a, b) => a + b, 0) / data.passRates.length
      const maxAttempts = Math.max(...data.attempts)

      // Generate insights
      if (passRate < 0.7) {
        analysis.insights.push({
          type: 'warning',
          testType,
          message: `معدل النجاح في ${getTestDisplayName(testType)} منخفض (${Math.round(passRate * 100)}%)`
        })
      }

      if (avgAttempts > 2) {
        analysis.insights.push({
          type: 'info',
          testType,
          message: `متوسط المحاولات في ${getTestDisplayName(testType)} مرتفع (${avgAttempts.toFixed(1)} محاولة)`
        })
      }
    }
  })

  return analysis
}

// Helper function to get test display name in Arabic
const getTestDisplayName = (testType) => {
  switch (testType) {
    case 'trafficLawTest':
      return 'اختبار قانون المرور'
    case 'manoeuvresTest':
      return 'الاختبار العملي'
    case 'drivingTest':
      return 'اختبار القيادة النهائي'
    default:
      return testType
  }
}

// Export data for external analysis
export const exportReportData = (clients, format = 'json') => {
  const report = generateClientReport(clients)

  switch (format) {
    case 'csv':
      return generateCSVReport(clients)
    case 'summary':
      return generateSummaryReport(report)
    default:
      return report
  }
}

// Generate CSV format data
const generateCSVReport = (clients) => {
  const headers = [
    'الاسم الأول',
    'الاسم الأخير',
    'رقم الهوية',
    'رقم الهاتف',
    'العمر',
    'الجنس',
    'البلدية',
    'حالة الدفع',
    'اختبار قانون المرور',
    'الاختبار العملي',
    'اختبار القيادة النهائي',
    'تاريخ التسجيل'
  ]

  const rows = clients.map((client) => {
    const age = calculateAge(client.birth_date)
    const tests = client.tests || {}

    return [
      client.first_name_ar || '',
      client.last_name_ar || '',
      client.national_id || '',
      client.phone_number || '',
      age || 0,
      client.gender === 'male' ? 'ذكر' : client.gender === 'female' ? 'أنثى' : '',
      client.current_municipality || '',
      client.paymentCompleted ? 'مدفوع' : 'غير مدفوع',
      tests.trafficLawTest?.passed
        ? 'نجح'
        : tests.trafficLawTest?.attempts > 0
          ? 'رسب'
          : 'لم يتقدم',
      tests.manoeuvresTest?.passed
        ? 'نجح'
        : tests.manoeuvresTest?.attempts > 0
          ? 'رسب'
          : 'لم يتقدم',
      tests.drivingTest?.passed ? 'نجح' : tests.drivingTest?.attempts > 0 ? 'رسب' : 'لم يتقدم',
      new Date(client.createdAt || client.register_date).toLocaleDateString('ar-SA')
    ]
  })

  return [headers, ...rows]
}

// Generate summary report
const generateSummaryReport = (report) => {
  return {
    title: 'تقرير ملخص أداء المدرسة',
    sections: [
      {
        title: 'نظرة عامة',
        data: {
          'إجمالي المتدربين': report.overview.totalClients,
          'المتدربين النشطين': report.overview.activeClients,
          'المتدربين المؤرشفين': report.overview.archivedClients,
          'معدل الإكمال': `${report.performance.completionRate}%`
        }
      },
      {
        title: 'الأداء في الاختبارات',
        data: {
          'معدل نجاح قانون المرور': `${report.performance.passRates.trafficLaw || 0}%`,
          'معدل نجاح الاختبار العملي': `${report.performance.passRates.maneuvers || 0}%`,
          'معدل نجاح اختبار القيادة': `${report.performance.passRates.driving || 0}%`
        }
      },
      {
        title: 'الوضع المالي',
        data: {
          'إجمالي الإيرادات': `${report.financial.totalRevenue} دج`,
          'العملاء المدفوعين': report.financial.paidClients,
          'العملاء غير المدفوعين': report.financial.unpaidClients,
          'متوسط الدفع': `${report.financial.averagePayment} دج`
        }
      }
    ]
  }
}
