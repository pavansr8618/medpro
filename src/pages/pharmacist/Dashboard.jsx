import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  FiHome, FiPackage, FiShoppingCart, FiAlertCircle, FiSearch, FiFileCheck
} from 'react-icons/fi'
import DashboardHome from './DashboardHome'
import Inventory from './Inventory'
import Orders from './Orders'
import PrescriptionVerification from './PrescriptionVerification'

const navItems = [
  { path: '/pharmacist/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/pharmacist/inventory', label: 'Inventory', icon: <FiPackage /> },
  { path: '/pharmacist/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { path: '/pharmacist/verify', label: 'Verify Prescription', icon: <FiFileCheck /> },
]

const PharmacistDashboard = () => {
  return (
    <Layout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="verify" element={<PrescriptionVerification />} />
      </Routes>
    </Layout>
  )
}

export default PharmacistDashboard

