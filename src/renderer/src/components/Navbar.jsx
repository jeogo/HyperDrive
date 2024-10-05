import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardListIcon // Import the icon for 'الامتحانات' (Exams)
} from '@heroicons/react/outline'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      icon: HomeIcon,
      title: 'الرئيسية',
      color: 'text-blue-600',
      activeColor: 'bg-blue-100'
    },
    {
      path: '/clients',
      icon: UsersIcon,
      title: 'قائمة العملاء',
      color: 'text-green-600',
      activeColor: 'bg-green-100'
    },
    {
      path: '/files',
      icon: FolderIcon,
      title: 'إدارة الملفات',
      color: 'text-purple-600',
      activeColor: 'bg-purple-100'
    },
    {
      path: '/payments',
      icon: CreditCardIcon,
      title: 'إدارة المدفوعات',
      color: 'text-yellow-600',
      activeColor: 'bg-yellow-100'
    },
    {
      path: '/submission-nomination',
      icon: DocumentTextIcon,
      title: 'إيداع وترشيح المتقدمين',
      color: 'text-indigo-600',
      activeColor: 'bg-indigo-100'
    },
    // New nav item for 'الامتحانات'
    {
      path: '/exams',
      icon: ClipboardListIcon,
      title: 'الامتحانات',
      color: 'text-teal-600',
      activeColor: 'bg-teal-100'
    }
  ]

  return (
    <nav className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-6 rtl:space-x-reverse">
            {navItems.map((item, index) => (
              <Link
                to={item.path}
                key={index}
                className={`flex items-center px-4 py-2 rounded-full text-md font-semibold transition-all duration-300 ease-in-out
                  ${
                    location.pathname === item.path
                      ? `${item.color} ${item.activeColor} shadow-md scale-105`
                      : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900'
                  }`}
              >
                <item.icon className={`h-6 w-6 ml-2 ${item.color}`} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
