import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import {
  Home,
  Clients,
  Register,
  Files,
  Payment,
  About,
  SubmissionAndNomination,
  Exams,
  Archive
} from './pages/index' // Import the new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/register" element={<Register />} />
        <Route path="/files" element={<Files />} />
        <Route path="/payments" element={<Payment />} />
        <Route path="/about" element={<About />} />
        <Route path="/submission-nomination" element={<SubmissionAndNomination />} />{' '}
        <Route path="/archive" element={<Archive />} />

        {/* New route */}
        <Route path="/exams" element={<Exams />} /> {/* New route */}
      </Routes>
    </Router>
  )
}

export default App
