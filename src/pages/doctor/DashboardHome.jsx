import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiCalendar, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    patients: 0,
    earnings: 0,
    prescriptions: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, earningsRes] = await Promise.all([
        axios.get('/api/appointments/doctor'),
        axios.get('/api/prescriptions/doctor'),
        axios.get('/api/analytics/doctor/appointments-stats'),
      ])
      setStats({
        appointments: appointmentsRes.data.length,
        prescriptions: prescriptionsRes.data.length,
        earnings: 0, // Would calculate from earnings endpoint
        patients: new Set(appointmentsRes.data.map(a => a.patient_id)).size,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your medical practice management</p>
      </div>

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
              <p className="text-gray-600 text-sm">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.patients}</p>
            </div>
            <FiUsers className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.prescriptions}</p>
            </div>
            <FiFileText className="text-purple-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.earnings}</p>
            </div>
            <FiDollarSign className="text-yellow-600 text-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

