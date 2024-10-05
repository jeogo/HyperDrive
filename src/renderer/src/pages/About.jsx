import { FaGithub, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { CodeIcon, DesktopComputerIcon, CogIcon } from '@heroicons/react/outline'
import Navbar from '../components/Navbar'
import HyperDrive from '../assets/icon.png'
import oussama from '../assets/oussama.jpg'
import nasro from '../assets/nasro.jpg'

const About = () => {
  return (
    <div dir="rtl" className="min-h-screen w-full flex flex-col bg-white">
      {/* Navbar at the top */}
      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center p-8 sm:p-16 lg:p-24">
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Developer Section */}
            <div className="sm:w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-4">قنفود اسامة</h1>
                <h1 className="text-4xl font-extrabold mb-4"> لجلط نصر الله</h1>

                <p className="text-lg mb-6 leading-relaxed">
                  مطور ويب متخصص في بناء تطبيقات حديثة باستخدام أحدث التقنيات. لدي خبرة واسعة في
                  تطوير التطبيقات باستخدام React و Electron و Node.js.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CodeIcon className="h-6 w-6 mr-2" aria-label="Technologies" />
                    <span>React, Electron, Node.js, Tailwind CSS</span>
                  </li>
                  <li className="flex items-center">
                    <DesktopComputerIcon className="h-6 w-6 mr-2" aria-label="Design" />
                    <span>تصميم واجهات متجاوبة وتطبيقات متعددة المنصات</span>
                  </li>
                  <li className="flex items-center">
                    <CogIcon className="h-6 w-6 mr-2" aria-label="Development" />
                    <span>التطوير المستمر ودمج الأنظمة باستخدام تقنيات Agile</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">تواصل معي</h2>
                <div className="flex gap-4">
                  <a
                    href="mailto:jeogodz@protonmail.com"
                    className="text-white hover:text-gray-300 transition"
                    aria-label="Email"
                  >
                    <FaEnvelope className="h-6 w-6" />
                  </a>

                  <a
                    href="https://github.com/jeogo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 transition"
                    aria-label="GitHub"
                  >
                    <FaGithub className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Software Section */}
            <div className="sm:w-1/2 p-8 flex flex-col justify-around">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-800 mb-4">hyperDrive</h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  hyperDrive هو نظام متكامل لإدارة مدارس القيادة، يهدف إلى تحسين كفاءة الإدارة
                  وتقديم تجربة أفضل للعملاء. يتميز بسهولة الاستخدام وواجهة عصرية.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <DesktopComputerIcon
                      className="h-6 w-6 text-blue-600 mr-2"
                      aria-label="Client Management"
                    />
                    <span>إدارة العملاء والمدفوعات بسهولة</span>
                  </li>
                  <li className="flex items-center">
                    <CodeIcon className="h-6 w-6 text-blue-600 mr-2" aria-label="UI Design" />
                    <span>واجهة مستخدم عصرية وسهلة التصفح</span>
                  </li>
                  <li className="flex items-center">
                    <CogIcon className="h-6 w-6 text-blue-600 mr-2" aria-label="Advanced Tools" />
                    <span>أدوات تحليل وتقارير متقدمة</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">معلومات إضافية</h2>
                <div className="flex gap-4 items-center">
                  <FaWhatsapp className="h-6 w-6 text-green-500" />
                  <span dir="ltr" className="text-gray-800">
                    +213 776 86 35 61
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="w-full flex justify-center gap-8 py-8">
            <div className="w-40 h-40 bg-white rounded-full overflow-hidden shadow-lg">
              <img src={nasro} alt="Profile" className="object-cover h-full w-full" />
            </div>
            <div className="w-40 h-40 bg-white rounded-full overflow-hidden shadow-lg">
              <img src={HyperDrive} alt="Profile" className="object-cover h-full w-full" />
            </div>
            <div className="w-40 h-40 bg-white rounded-full overflow-hidden shadow-lg">
              <img src={oussama} alt="Profile" className="object-cover h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
