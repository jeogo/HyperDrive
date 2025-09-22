import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  UserAddIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  ArchiveIcon,
  CalendarIcon,
  TrendingUpIcon
} from '@heroicons/react/outline'

const Home = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    archivedClients: 0,
    totalExams: 0,
    submittedApplications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get API reference
      const api = window.api
      if (!api || !api.readClients) {
        throw new Error('API not available')
      }

      const totalClients = await api.readClients()
      const activeClients = totalClients.filter((client) => !client.isArchived && !client.archived)
      const archivedClients = totalClients.filter((client) => client.isArchived || client.archived)

      setStats({
        totalClients: totalClients.length,
        activeClients: activeClients.length,
        archivedClients: archivedClients.length,
        totalExams: totalClients.filter((client) => client.examDate).length,
        submittedApplications: totalClients.filter((client) => client.submissionDate).length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats({
        totalClients: 0,
        activeClients: 0,
        archivedClients: 0,
        totalExams: 0,
        submittedApplications: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, bgColor, textColor, path }) => (
    <Link to={path} className="no-underline">
      <div
        className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer`}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`p-3 rounded-lg bg-white shadow-sm`}>
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
          <div>
            <p className={`text-sm ${textColor} opacity-80 font-medium`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{loading ? '...' : value}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  const QuickActionCard = ({ icon: Icon, title, description, bgColor, hoverColor, path }) => (
    <Link to={path} className="no-underline">
      <div
        className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${hoverColor}`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white opacity-90 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🏠 لوحة التحكم الرئيسية</h1>
            <p className="text-gray-600">مرحباً بك في نظام إدارة مدرسة تعليم السياقة</p>
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{getCurrentDate()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          📊 إحصائيات النظام
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={UsersIcon}
            title="إجمالي العملاء"
            value={stats.totalClients}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            path="/clients"
          />
          <StatCard
            icon={TrendingUpIcon}
            title="العملاء النشطون"
            value={stats.activeClients}
            bgColor="bg-green-50"
            textColor="text-green-700"
            path="/clients"
          />
          <StatCard
            icon={ArchiveIcon}
            title="العملاء المؤرشفون"
            value={stats.archivedClients}
            bgColor="bg-gray-50"
            textColor="text-gray-700"
            path="/archive"
          />
          <StatCard
            icon={ClipboardListIcon}
            title="الامتحانات"
            value={stats.totalExams}
            bgColor="bg-purple-50"
            textColor="text-purple-700"
            path="/exams"
          />
          <StatCard
            icon={DocumentTextIcon}
            title="الطلبات المقدمة"
            value={stats.submittedApplications}
            bgColor="bg-indigo-50"
            textColor="text-indigo-700"
            path="/submission-nomination"
          />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          ⚡ الإجراءات السريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            icon={UserAddIcon}
            title="تسجيل عميل جديد"
            description="إضافة عميل جديد إلى النظام"
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            hoverColor="hover:from-purple-600 hover:to-purple-700"
            path="/register"
          />
          <QuickActionCard
            icon={UsersIcon}
            title="إدارة العملاء"
            description="عرض وإدارة قائمة العملاء"
            bgColor="bg-gradient-to-br from-green-500 to-green-600"
            hoverColor="hover:from-green-600 hover:to-green-700"
            path="/clients"
          />
          <QuickActionCard
            icon={ClipboardListIcon}
            title="الامتحانات"
            description="متابعة وإدارة الامتحانات"
            bgColor="bg-gradient-to-br from-teal-500 to-teal-600"
            hoverColor="hover:from-teal-600 hover:to-teal-700"
            path="/exams"
          />
          <QuickActionCard
            icon={DocumentTextIcon}
            title="إيداع وترشيح"
            description="إدارة إيداع وترشيح المتقدمين"
            bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
            hoverColor="hover:from-indigo-600 hover:to-indigo-700"
            path="/submission-nomination"
          />
        </div>
      </div>

      {/* System Information Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          ℹ️ معلومات النظام
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">🏢</span>
              </div>
              <h3 className="font-semibold text-blue-800">إدارة شاملة</h3>
            </div>
            <p className="text-blue-600 text-sm leading-relaxed">
              نظام متكامل لإدارة العملاء والعمليات
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-lg">✨</span>
              </div>
              <h3 className="font-semibold text-green-800">سهولة الاستخدام</h3>
            </div>
            <p className="text-green-600 text-sm leading-relaxed">واجهة بسيطة وسهلة الاستخدام</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-lg">🔐</span>
              </div>
              <h3 className="font-semibold text-purple-800">أمان البيانات</h3>
            </div>
            <p className="text-purple-600 text-sm leading-relaxed">حماية متقدمة لبيانات العملاء</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
