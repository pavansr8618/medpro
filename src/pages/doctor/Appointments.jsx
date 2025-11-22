import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { FiClock, FiUser, FiCheck, FiX } from 'react-icons/fi'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState({})

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/doctor')
      setAppointments(response.data)
      // Fetch patient details
      const patientIds = [...new Set(response.data.map(a => a.patient_id))]
      // In a real app, you'd fetch patient details
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status })
      fetchAppointments()
    } catch (error) {
      alert('Error updating appointment status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">Manage your patient appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      <span>Patient #{apt.patient_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-gray-400" />
                      <span>{format(new Date(apt.appointment_date), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{apt.reason || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800"
                            title="Confirm"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark Complete"
                        >
                          <FiCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Appointments

