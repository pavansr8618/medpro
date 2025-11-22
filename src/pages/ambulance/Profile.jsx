import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiUser, FiTruck, FiPhone } from 'react-icons/fi'

const Profile = () => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/ambulances/profile')
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
        <p className="text-gray-600 mt-2">View and manage your profile information</p>
      </div>

      {profile && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <FiUser className="text-primary-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Driver Name</p>
                <p className="text-lg font-medium">{profile.driver_name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiPhone className="text-primary-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg font-medium">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiTruck className="text-primary-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="text-lg font-medium">{profile.vehicle_number}</p>
              </div>
            </div>
            {profile.license_number && (
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="text-lg font-medium">{profile.license_number}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 text-sm rounded-full ${
                profile.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.is_available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile

