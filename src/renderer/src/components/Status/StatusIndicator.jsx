import PropTypes from 'prop-types'
import { calculateAge } from '../../utils/clientUtils'

const StatusIndicator = ({ client }) => {
  // Calculate client status based on tests and age
  const getClientStatus = () => {
    if (!client) return { status: 'unknown', label: 'غير محدد', color: 'bg-gray-400' }

    const age = calculateAge(client.birth_date)
    const trafficLawPassed = client.tests?.trafficLawTest?.passed || false
    const practicalPassed = client.tests?.manoeuvresTest?.passed || false
    const finalPassed = client.tests?.drivingTest?.passed || false

    // Final test passed - completed
    if (finalPassed) {
      return { status: 'completed', label: 'مكتمل', color: 'bg-green-500' }
    }

    // Ready for final test
    if (practicalPassed && age >= 18) {
      return { status: 'ready-final', label: 'جاهز للاختبار النهائي', color: 'bg-blue-500' }
    }

    // Ready for practical test
    if (trafficLawPassed && age >= 18) {
      return { status: 'ready-practical', label: 'جاهز للاختبار العملي', color: 'bg-orange-500' }
    }

    // Ready for traffic law test
    if (age >= 18) {
      return { status: 'ready-traffic', label: 'جاهز لقانون المرور', color: 'bg-yellow-500' }
    }

    // Under age
    if (age < 18) {
      return { status: 'under-age', label: 'أقل من 18 سنة', color: 'bg-gray-500' }
    }

    // Default - just registered
    return { status: 'registered', label: 'مسجل', color: 'bg-purple-500' }
  }

  const { label, color } = getClientStatus()

  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${color} ml-2`}></div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  )
}

StatusIndicator.propTypes = {
  client: PropTypes.object.isRequired
}

export default StatusIndicator
