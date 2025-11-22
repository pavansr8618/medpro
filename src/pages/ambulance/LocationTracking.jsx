import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiMapPin, FiNavigation } from 'react-icons/fi'

const LocationTracking = () => {
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [isTracking, setIsTracking] = useState(false)
  const [watchId, setWatchId] = useState(null)

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const startTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          updateLocationOnServer(newLocation)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location')
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
      setWatchId(id)
      setIsTracking(true)
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsTracking(false)
    }
  }

  const updateLocationOnServer = async (loc) => {
    try {
      await axios.put('/api/ambulances/location', {
        latitude: loc.lat,
        longitude: loc.lng,
      })
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Location Tracking</h1>
        <p className="text-gray-600 mt-2">Track and update your current location</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <FiMapPin className="mr-2" />
            Current Location
          </h2>
          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`px-4 py-2 rounded-lg ${
              isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>

        {location.lat && location.lng ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Latitude</p>
              <p className="text-lg font-mono">{location.lat.toFixed(6)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Longitude</p>
              <p className="text-lg font-mono">{location.lng.toFixed(6)}</p>
            </div>
            <div className="mt-4">
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center inline-block"
              >
                <FiNavigation className="mr-2" />
                View on Google Maps
              </a>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Location not available. Click "Start Tracking" to begin.</p>
        )}
      </div>
    </div>
  )
}

export default LocationTracking

