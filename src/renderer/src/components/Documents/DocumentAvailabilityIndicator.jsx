import PropTypes from 'prop-types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { calculateAge } from '../../utils/clientUtils'

const DocumentAvailabilityIndicator = ({ client }) => {
  const getDocumentAvailability = () => {
    if (!client) return []

    const age = calculateAge(client.birth_date)
    const trafficLawPassed = client.tests?.trafficLawTest?.passed || false
    const practicalPassed = client.tests?.manoeuvresTest?.passed || false

    const documents = [
      {
        id: 'medical',
        name: 'الشهادة الطبية',
        available: true,
        reason: 'متاح دائماً'
      },
      {
        id: 'form',
        name: 'نموذج الاستمارة',
        available: true,
        reason: 'متاح دائماً'
      },
      {
        id: 'trafficLaw',
        name: 'بطاقة دروس قانون المرور',
        available: age >= 18,
        reason: age >= 18 ? 'متاح' : 'العمر أقل من 18 سنة'
      },
      {
        id: 'followUp',
        name: 'بطاقة المتابعة',
        available: trafficLawPassed,
        reason: trafficLawPassed ? 'متاح' : 'يجب اجتياز اختبار قانون المرور'
      },
      {
        id: 'preparation',
        name: 'بطاقة الإعداد للمناورات',
        available: practicalPassed,
        reason: practicalPassed ? 'متاح' : 'يجب اجتياز الاختبار العملي'
      }
    ]

    return documents
  }

  const documents = getDocumentAvailability()

  const getIcon = (available) => {
    if (available) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />
    }
    return <XCircleIcon className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">الوثائق المتاحة:</h4>
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            {getIcon(doc.available)}
            <span className={`mr-2 ${doc.available ? 'text-gray-700' : 'text-gray-500'}`}>
              {doc.name}
            </span>
          </div>
          {!doc.available && <span className="text-xs text-gray-500">{doc.reason}</span>}
        </div>
      ))}
    </div>
  )
}

DocumentAvailabilityIndicator.propTypes = {
  client: PropTypes.object.isRequired
}

export default DocumentAvailabilityIndicator
