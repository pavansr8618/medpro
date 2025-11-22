import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  FiHome, FiMapPin, FiAlertCircle, FiUser, FiNavigation
} from 'react-icons/fi'
import DashboardHome from './DashboardHome'
import EmergencyRequests from './EmergencyRequests'
import LocationTracking from './LocationTracking'
import Profile from './Profile'

const navItems = [
  { path: '/ambulance/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/ambulance/emergencies', label: 'Emergency Requests', icon: <FiAlertCircle /> },
  { path: '/ambulance/location', label: 'Location Tracking', icon: <FiMapPin /> },
  { path: '/ambulance/profile', label: 'Profile', icon: <FiUser /> },
]

const AmbulanceDashboard = () => {
  return (
    <Layout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="emergencies" element={<EmergencyRequests />} />
        <Route path="location" element={<LocationTracking />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default AmbulanceDashboard

