import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiUsers, FiUserCheck, FiCalendar, FiShoppingCart, FiAlertCircle } from 'react-icons/fi'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalPharmacists: 0,
    totalAmbulances: 0,
    totalAppointments: 0,
    totalOrders: 0,
    totalEmergencies: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <FiUsers className="text-primary-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
            </div>
            <FiUserCheck className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDoctors}</p>
            </div>
            <FiUserCheck className="text-blue-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pharmacists</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPharmacists}</p>
            </div>
            <FiUserCheck className="text-purple-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ambulances</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAmbulances}</p>
            </div>
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
            </div>
            <FiCalendar className="text-yellow-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <FiShoppingCart className="text-orange-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Emergencies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmergencies}</p>
            </div>
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

