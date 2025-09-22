import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  ArchiveIcon,
  UserAddIcon,
  InformationCircleIcon
} from '@heroicons/react/outline'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      path: '/',
      icon: HomeIcon,
      title: 'الرئيسية',
      color: 'text-blue-600',
      activeColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-50'
    },
    {
      path: '/register',
      icon: UserAddIcon,
      title: 'تسجيل عميل جديد',
      color: 'text-purple-600',
      activeColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-50'
    },
    {
      path: '/clients',
      icon: UsersIcon,
      title: 'قائمة العملاء',
      color: 'text-green-600',
      activeColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-50'
    },
    {
      path: '/submission-nomination',
      icon: DocumentTextIcon,
      title: 'إيداع وترشيح المتقدمين',
      color: 'text-indigo-600',
      activeColor: 'bg-indigo-100',
      hoverColor: 'hover:bg-indigo-50'
    },
    {
      path: '/exams',
      icon: ClipboardListIcon,
      title: 'الامتحانات',
      color: 'text-teal-600',
      activeColor: 'bg-teal-100',
      hoverColor: 'hover:bg-teal-50'
    },
    {
      path: '/archive',
      icon: ArchiveIcon,
      title: 'الأرشيف',
      color: 'text-gray-600',
      activeColor: 'bg-gray-100',
      hoverColor: 'hover:bg-gray-50'
    }
  ]

  const bottomNavItems = [
    {
      path: '/about',
      icon: InformationCircleIcon,
      title: 'عن النظام',
      color: 'text-red-600',
      activeColor: 'bg-red-100',
      hoverColor: 'hover:bg-red-50'
    }
  ]

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-l border-gray-200 h-screen flex flex-col shadow-lg transition-all duration-300 ease-in-out relative`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-6 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HD</span>
          </div>
          {!isCollapsed && (
            <div className="mr-3">
              <h1 className="text-lg font-bold text-gray-800">HyperDrive</h1>
              <p className="text-xs text-gray-500">نظام إدارة مدرسة تعليم السياقة</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${location.pathname === item.path ? `${item.color} ${item.activeColor} shadow-sm border-l-4 border-current` : `text-gray-600 ${item.hoverColor}`}`}
                title={isCollapsed ? item.title : ''}
              >
                <item.icon
                  className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'ml-3'} ${item.color} transition-colors`}
                />
                {!isCollapsed && (
                  <span className="transition-opacity duration-200">{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-2 border-t border-gray-200">
        <ul className="space-y-1">
          {bottomNavItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${location.pathname === item.path ? `${item.color} ${item.activeColor} shadow-sm border-l-4 border-current` : `text-gray-600 ${item.hoverColor}`}`}
                title={isCollapsed ? item.title : ''}
              >
                <item.icon
                  className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'ml-3'} ${item.color} transition-colors`}
                />
                {!isCollapsed && (
                  <span className="transition-opacity duration-200">{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">الإصدار 1.0.0</p>
            <p className="text-xs text-gray-400">© 2024 HyperDrive</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
