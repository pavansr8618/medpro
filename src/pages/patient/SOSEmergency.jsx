import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiAlertCircle, FiMapPin } from 'react-icons/fi'

const SOSEmergency = () => {
  const [emergencies, setEmergencies] = useState([])
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmergencies()
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enter it manually.')
        }
      )
    }
  }

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get('/api/emergency/patient')
      setEmergencies(response.data)
    } catch (error) {
      console.error('Error fetching emergencies:', error)
    }
  }

  const handleSOS = async () => {
    if (!location.lat || !location.lng || !address) {
      alert('Please provide your location and address')
      return
    }

    if (!window.confirm('Are you sure you want to send an SOS emergency alert?')) {
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/emergency/sos', {
        latitude: location.lat,
        longitude: location.lng,
        address,
        description,
      })
      alert('SOS Emergency alert sent! Help is on the way.')
      setAddress('')
      setDescription('')
      fetchEmergencies()
    } catch (error) {
      alert('Error sending SOS: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SOS Emergency</h1>
        <p className="text-gray-600 mt-2">Send emergency alerts for immediate medical assistance</p>
      </div>

      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiAlertCircle className="text-red-600 text-3xl mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-red-900">Emergency Alert</h2>
            <p className="text-red-700">Use this only in case of medical emergencies</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                onClick={getCurrentLocation}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <FiMapPin className="mr-2" />
                Get Location
              </button>
            </div>
            {location.lat && location.lng && (
              <p className="text-sm text-gray-600 mt-1">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows="4"
            />
          </div>

          <button
            onClick={handleSOS}
            disabled={loading || !address}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 text-lg font-bold flex items-center justify-center"
          >
            <FiAlertCircle className="mr-2" />
            {loading ? 'Sending...' : 'SEND SOS EMERGENCY ALERT'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Emergency History</h2>
        {emergencies.length === 0 ? (
          <p className="text-gray-500">No emergency requests</p>
        ) : (
          <div className="space-y-4">
            {emergencies.map((emergency) => (
              <div key={emergency.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    emergency.status === 'completed' ? 'bg-green-100 text-green-800' :
                    emergency.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    emergency.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {emergency.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(emergency.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{emergency.address}</p>
                {emergency.description && (
                  <p className="text-sm text-gray-600 mt-1">{emergency.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SOSEmergency

