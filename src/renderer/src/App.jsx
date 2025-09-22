import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import {
  Home,
  Clients,
  Register,
  About,
  SubmissionAndNomination,
  Exams,
  Archive
} from './pages/index'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clients" element={<Clients />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="submission-nomination" element={<SubmissionAndNomination />} />
          <Route path="archive" element={<Archive />} />
          <Route path="exams" element={<Exams />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
