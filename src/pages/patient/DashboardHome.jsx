import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FiCalendar, FiActivity, FiFileText, FiShoppingCart, FiAlertCircle } from 'react-icons/fi'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    healthRecords: 0,
    orders: 0,
    emergencies: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [appointments, records, orders, emergencies] = await Promise.all([
        axios.get('/api/appointments/patient'),
        axios.get('/api/health-records'),
        axios.get('/api/medicines/orders'),
        axios.get('/api/emergency/patient'),
      ])
      setStats({
        appointments: appointments.data.length,
        healthRecords: records.data.length,
        orders: orders.data.length,
        emergencies: emergencies.data.length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const quickActions = [
    { icon: <FiCalendar />, label: 'Book Appointment', path: '/patient/appointments', color: 'bg-blue-500' },
    { icon: <FiActivity />, label: 'Add Health Data', path: '/patient/health-tracker', color: 'bg-green-500' },
    { icon: <FiFileText />, label: 'Upload Record', path: '/patient/health-records', color: 'bg-purple-500' },
    { icon: <FiShoppingCart />, label: 'Order Medicine', path: '/patient/medicines', color: 'bg-orange-500' },
    { icon: <FiAlertCircle />, label: 'SOS Emergency', path: '/patient/emergency', color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your health overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.appointments}</p>
            </div>
            <FiCalendar className="text-primary-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Health Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.healthRecords}</p>
            </div>
            <FiFileText className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Medicine Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
            </div>
            <FiShoppingCart className="text-orange-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Emergencies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.emergencies}</p>
            </div>
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition"
            >
              <div className={`${action.color} text-white p-3 rounded-full mb-2`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

