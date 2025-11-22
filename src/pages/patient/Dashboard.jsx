import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  FiHome, FiCalendar, FiActivity, FiFileText, FiMessageCircle,
  FiSearch, FiShoppingCart, FiVideo, FiAlertCircle, FiBarChart
} from 'react-icons/fi'
import DashboardHome from './DashboardHome'
import Appointments from './Appointments'
import HealthTracker from './HealthTracker'
import HealthRecords from './HealthRecords'
import Chatbot from './Chatbot'
import SymptomsChecker from './SymptomsChecker'
import MedicineOrdering from './MedicineOrdering'
import VideoConsultation from './VideoConsultation'
import SOSEmergency from './SOSEmergency'
import HealthInsights from './HealthInsights'

const navItems = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/patient/appointments', label: 'Appointments', icon: <FiCalendar /> },
  { path: '/patient/health-tracker', label: 'Health Tracker', icon: <FiActivity /> },
  { path: '/patient/health-records', label: 'Health Records', icon: <FiFileText /> },
  { path: '/patient/chatbot', label: 'Chatbot', icon: <FiMessageCircle /> },
  { path: '/patient/symptoms', label: 'Symptoms Checker', icon: <FiSearch /> },
  { path: '/patient/medicines', label: 'Medicine Ordering', icon: <FiShoppingCart /> },
  { path: '/patient/consultations', label: 'Video Consultation', icon: <FiVideo /> },
  { path: '/patient/emergency', label: 'SOS Emergency', icon: <FiAlertCircle /> },
  { path: '/patient/insights', label: 'Health Insights', icon: <FiBarChart /> },
]

const PatientDashboard = () => {
  return (
    <Layout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="health-tracker" element={<HealthTracker />} />
        <Route path="health-records" element={<HealthRecords />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="symptoms" element={<SymptomsChecker />} />
        <Route path="medicines" element={<MedicineOrdering />} />
        <Route path="consultations" element={<VideoConsultation />} />
        <Route path="emergency" element={<SOSEmergency />} />
        <Route path="insights" element={<HealthInsights />} />
      </Routes>
    </Layout>
  )
}

export default PatientDashboard

