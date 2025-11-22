import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  FiHome, FiUsers, FiCheckCircle, FiBarChart, FiMessageSquare, FiSettings
} from 'react-icons/fi'
import DashboardHome from './DashboardHome'
import UserManagement from './UserManagement'
import Verification from './Verification'
import Analytics from './Analytics'
import Complaints from './Complaints'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/admin/users', label: 'User Management', icon: <FiUsers /> },
  { path: '/admin/verification', label: 'Verification', icon: <FiCheckCircle /> },
  { path: '/admin/analytics', label: 'Analytics', icon: <FiBarChart /> },
  { path: '/admin/complaints', label: 'Complaints', icon: <FiMessageSquare /> },
]

const AdminDashboard = () => {
  return (
    <Layout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="verification" element={<Verification />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="complaints" element={<Complaints />} />
      </Routes>
    </Layout>
  )
}

export default AdminDashboard

