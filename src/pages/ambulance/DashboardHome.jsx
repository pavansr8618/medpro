import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiAlertCircle, FiMapPin, FiCheckCircle } from 'react-icons/fi'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    completed: 0,
    isAvailable: true,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [emergenciesRes, profileRes] = await Promise.all([
        axios.get('/api/emergency/ambulance'),
        axios.get('/api/ambulances/profile'),
      ])
      setStats({
        activeEmergencies: emergenciesRes.data.filter(e => e.status !== 'completed').length,
        completed: emergenciesRes.data.filter(e => e.status === 'completed').length,
        isAvailable: profileRes.data.is_available,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const toggleAvailability = async () => {
    try {
      await axios.put('/api/ambulances/availability', {
        is_available: !stats.isAvailable,
      })
      setStats({ ...stats, isAvailable: !stats.isAvailable })
    } catch (error) {
      alert('Error updating availability')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ambulance Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage emergency response operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Emergencies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeEmergencies}</p>
            </div>
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <FiCheckCircle className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className={`text-2xl font-bold mt-1 ${stats.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {stats.isAvailable ? 'Available' : 'Busy'}
              </p>
            </div>
            <FiMapPin className="text-primary-600 text-3xl" />
          </div>
          <button
            onClick={toggleAvailability}
            className={`mt-4 w-full py-2 px-4 rounded-lg ${
              stats.isAvailable
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {stats.isAvailable ? 'Mark as Busy' : 'Mark as Available'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

