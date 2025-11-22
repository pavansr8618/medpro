import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiMapPin, FiCheck, FiX } from 'react-icons/fi'
import { format } from 'date-fns'

const EmergencyRequests = () => {
  const [emergencies, setEmergencies] = useState([])

  useEffect(() => {
    fetchEmergencies()
    const interval = setInterval(fetchEmergencies, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get('/api/emergency/ambulance')
      setEmergencies(response.data)
    } catch (error) {
      console.error('Error fetching emergencies:', error)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/emergency/${id}/status`, { status })
      fetchEmergencies()
    } catch (error) {
      alert('Error updating status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Emergency Requests</h1>
        <p className="text-gray-600 mt-2">Respond to emergency requests</p>
      </div>

      <div className="space-y-4">
        {emergencies.map((emergency) => (
          <div key={emergency.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Emergency #{emergency.id}</h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(emergency.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                emergency.status === 'completed' ? 'bg-green-100 text-green-800' :
                emergency.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                emergency.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {emergency.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <FiMapPin className="mr-2" />
                <span>{emergency.address}</span>
              </div>
              {emergency.description && (
                <p className="text-gray-600">{emergency.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Coordinates: {emergency.latitude.toFixed(6)}, {emergency.longitude.toFixed(6)}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              {emergency.status === 'assigned' && (
                <button
                  onClick={() => updateStatus(emergency.id, 'in_transit')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <FiCheck className="mr-2" />
                  Start Journey
                </button>
              )}
              {emergency.status === 'in_transit' && (
                <button
                  onClick={() => updateStatus(emergency.id, 'completed')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FiCheck className="mr-2" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
        {emergencies.length === 0 && (
          <p className="text-gray-500 text-center py-8">No emergency requests</p>
        )}
      </div>
    </div>
  )
}

export default EmergencyRequests

