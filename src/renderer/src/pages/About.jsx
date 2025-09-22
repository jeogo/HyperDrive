import { CodeIcon, DesktopComputerIcon, CogIcon, MailIcon } from '@heroicons/react/outline'
import { FaGithub, FaWhatsapp } from 'react-icons/fa'
import HyperDrive from '../assets/icon.png'
import oussama from '../assets/oussama.jpg'
import nasro from '../assets/nasro.jpg'

const About = () => {
  return (
    <div className="space-y-6 min-h-full w-full">
      {/* Standard Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ℹ️ حول التطبيق</h1>
            <p className="text-gray-600">معلومات حول HyperDrive وفريق التطوير</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <img src={HyperDrive} alt="HyperDrive" className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About HyperDrive */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 ml-4">
              <img src={HyperDrive} alt="HyperDrive Logo" className="w-12 h-12 rounded-full" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">HyperDrive</h2>
              <p className="text-gray-600">نظام إدارة مدارس القيادة</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              HyperDrive هو نظام متكامل لإدارة مدارس القيادة، مصمم لتحسين كفاءة الإدارة وتقديم تجربة
              أفضل للمتدربين والموظفين. يتميز بواجهة عصرية وسهولة في الاستخدام.
            </p>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg ml-3">
                  <DesktopComputerIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700">إدارة شاملة للمتدربين والدورات</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg ml-3">
                  <CodeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700">واجهة مستخدم حديثة ومتجاوبة</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg ml-3">
                  <CogIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700">أدوات تقارير وتحليل متطورة</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 التقنيات المستخدمة</h3>
            <div className="flex flex-wrap gap-3">
              {['React', 'Electron', 'Tailwind CSS', 'Node.js', 'SQLite'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-100"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Development Team */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 ml-3">
              <span className="text-green-600 text-xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">فريق التطوير</h2>
          </div>

          <div className="space-y-6">
            {/* Developer 1 */}
            <div className="flex items-start space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg border border-gray-100">
              <img
                src={oussama}
                alt="أسامة جوقو"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">أسامة جوقو</h3>
                <p className="text-blue-600 font-medium">مطور البرمجيات الرئيسي</p>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  مطور متخصص في تقنيات الويب الحديثة مع خبرة واسعة في React وElectron وتطوير
                  التطبيقات المكتبية.
                </p>
              </div>
            </div>

            {/* Developer 2 */}
            <div className="flex items-start space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg border border-gray-100">
              <img
                src={nasro}
                alt="نصر الدين"
                className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">نصر الدين</h3>
                <p className="text-green-600 font-medium">مطور مساعد ومصمم واجهات</p>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  مطور ومصمم متخصص في تطوير واجهات المستخدم وتحسين تجربة المستخدم في التطبيقات
                  الحديثة.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-gray-500 ml-3" />
                <a
                  href="mailto:jeogodz@protonmail.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  jeogodz@protonmail.com
                </a>
              </div>
              <div className="flex items-center">
                <FaGithub className="h-5 w-5 text-gray-500 ml-3" />
                <a
                  href="https://github.com/jeogo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  github.com/jeogo
                </a>
              </div>
              <div className="flex items-center">
                <FaWhatsapp className="h-5 w-5 text-green-500 ml-3" />
                <a
                  href="https://wa.me/213776863561"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 transition-colors"
                  dir="ltr"
                >
                  +213 776 86 35 61
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 ml-3">
            <span className="text-indigo-600 text-xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">معلومات الإصدار</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">الإصدار</p>
            <p className="text-lg font-bold text-blue-800">1.0.0</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <p className="text-sm text-green-600 font-medium mb-1">تاريخ الإصدار</p>
            <p className="text-lg font-bold text-green-800">سبتمبر 2025</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
            <p className="text-sm text-purple-600 font-medium mb-1">الترخيص</p>
            <p className="text-lg font-bold text-purple-800">MIT License</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
