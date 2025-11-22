import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  FiHome, FiCalendar, FiFileText, FiVideo, FiDollarSign,
  FiUsers, FiBrain, FiEdit
} from 'react-icons/fi'
import DashboardHome from './DashboardHome'
import Appointments from './Appointments'
import Prescriptions from './Prescriptions'
import Consultations from './Consultations'
import PatientHistory from './PatientHistory'
import Earnings from './Earnings'
import Notes from './Notes'

const navItems = [
  { path: '/doctor/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/doctor/appointments', label: 'Appointments', icon: <FiCalendar /> },
  { path: '/doctor/prescriptions', label: 'Prescriptions', icon: <FiFileText /> },
  { path: '/doctor/consultations', label: 'Consultations', icon: <FiVideo /> },
  { path: '/doctor/patients', label: 'Patient History', icon: <FiUsers /> },
  { path: '/doctor/earnings', label: 'Earnings', icon: <FiDollarSign /> },
  { path: '/doctor/notes', label: 'Notes', icon: <FiEdit /> },
]

const DoctorDashboard = () => {
  return (
    <Layout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="patients" element={<PatientHistory />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="notes" element={<Notes />} />
      </Routes>
    </Layout>
  )
}

export default DoctorDashboard

