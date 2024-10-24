// Home.jsx

import {
  UserAddIcon,
  UsersIcon,
  FolderOpenIcon,
  CreditCardIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  ArchiveIcon
} from '@heroicons/react/outline'
import { Link } from 'react-router-dom'

// Card Component
const Card = ({ path, icon: Icon, title, bgColor, hoverColor }) => (
  <Link to={path} className="no-underline">
    <div
      className={`w-full sm:w-64 p-8 ${bgColor} rounded-3xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl ${hoverColor}`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <Icon className="text-white h-14 w-14" />
        <p className="font-semibold text-white text-lg sm:text-xl">{title}</p>
      </div>
    </div>
  </Link>
)

// Cards Data
const cards = [
  {
    path: '/register',
    icon: UserAddIcon,
    title: 'تسجيل عميل جديد',
    bgColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
    hoverColor: 'hover:from-blue-600 hover:to-purple-600'
  },
  {
    path: '/clients',
    icon: UsersIcon,
    title: 'قائمة العملاء',
    bgColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    hoverColor: 'hover:from-green-600 hover:to-teal-600'
  },
  {
    path: '/payments',
    icon: CreditCardIcon,
    title: 'إدارة المدفوعات',
    bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    hoverColor: 'hover:from-yellow-600 hover:to-orange-600'
  },
  {
    path: '/submission-nomination',
    icon: DocumentTextIcon,
    title: 'إيداع وترشيح المتقدمين',
    bgColor: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    hoverColor: 'hover:from-indigo-600 hover:to-blue-600'
  },
  {
    path: '/exams',
    icon: ClipboardListIcon,
    title: 'الامتحانات',
    bgColor: 'bg-gradient-to-r from-teal-500 to-green-500',
    hoverColor: 'hover:from-teal-600 hover:to-green-600'
  },
  {
    path: '/files',
    icon: FolderOpenIcon,
    title: 'إدارة الملفات',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600'
  },
  {
    path: '/archive',
    icon: ArchiveIcon,
    title: 'الأرشيف',
    bgColor: 'bg-gradient-to-r from-gray-500 to-gray-700',
    hoverColor: 'hover:from-gray-600 hover:to-gray-800'
  },
  {
    path: '/about',
    icon: InformationCircleIcon,
    title: 'عن النظام',
    bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
    hoverColor: 'hover:from-red-600 hover:to-pink-600'
  }
]

// Home Component
const Home = () => {
  // Welcome Section
  const renderWelcomeSection = () => (
    <div className="text-center mb-12 w-full">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
        مرحبًا بك في HyperDrive
      </h1>
      <p className="text-lg sm:text-2xl text-gray-600">
        نظام متكامل لإدارة العملاء والمدفوعات بفعالية وسهولة.
      </p>
    </div>
  )

  // Cards Section
  const renderCardsSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full justify-items-center">
      {cards.map((card, index) => (
        <Card
          key={index}
          path={card.path}
          icon={card.icon}
          title={card.title}
          bgColor={card.bgColor}
          hoverColor={card.hoverColor}
        />
      ))}
    </div>
  )

  // Features Section
  const renderFeaturesSection = () => (
    <div className="mt-16 w-full max-w-6xl">
      <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12 w-full">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">ميزات النظام</h2>
          <ul className="text-base sm:text-lg text-gray-600 leading-relaxed space-y-4 list-none">
            <li>إدارة العملاء بمرونة وفعالية</li>
            <li>نظام مدفوعات متكامل وسهل الاستخدام</li>
            <li>تتبع وإدارة الملفات بدقة</li>
            <li>واجهة مستخدم عصرية وسهلة التصفح</li>
            <li>أدوات تحليل وتقارير متقدمة</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div
      dir="rtl"
      className="w-screen h-screen flex flex-col overflow-hidden items-center bg-gradient-to-b from-gray-100 to-gray-200"
    >
      <main className="flex-grow overflow-y-auto w-full justify-center items-center">
        <div className="flex flex-col items-center py-12 px-6 lg:px-16 w-full">
          {renderWelcomeSection()}
          {renderCardsSection()}
          {renderFeaturesSection()}
        </div>
      </main>
    </div>
  )
}

export default Home
