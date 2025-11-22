import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiVideo, FiPhone } from 'react-icons/fi'
import { format } from 'date-fns'

const Consultations = () => {
  const [consultations, setConsultations] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    fetchConsultations()
    fetchAppointments()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/api/consultations/doctor')
      setConsultations(response.data)
    } catch (error) {
      console.error('Error fetching consultations:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/doctor')
      setAppointments(response.data.filter(apt => apt.status === 'confirmed'))
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const startConsultation = async (appointmentId, type) => {
    try {
      const response = await axios.post('/api/consultations/', {
        appointment_id: appointmentId,
        consultation_type: type,
      })
      const roomId = response.data.room_id
      alert(`Consultation room created: ${roomId}\n\nIn a production app, this would open the ${type} call interface.`)
      fetchConsultations()
    } catch (error) {
      alert('Error starting consultation: ' + (error.response?.data?.detail || error.message))
    }
  }

  const endConsultation = async (consultationId) => {
    try {
      await axios.put(`/api/consultations/${consultationId}/end`)
      fetchConsultations()
    } catch (error) {
      alert('Error ending consultation')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
        <p className="text-gray-600 mt-2">Manage video and audio consultations</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Start Consultation</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No confirmed appointments available</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment #{apt.id}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(apt.appointment_date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startConsultation(apt.id, 'video')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <FiVideo className="mr-2" />
                    Video
                  </button>
                  <button
                    onClick={() => startConsultation(apt.id, 'audio')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FiPhone className="mr-2" />
                    Audio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Active Consultations</h2>
        {consultations.filter(c => !c.end_time).length === 0 ? (
          <p className="text-gray-500">No active consultations</p>
        ) : (
          <div className="space-y-4">
            {consultations.filter(c => !c.end_time).map((consult) => (
              <div key={consult.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{consult.consultation_type} Consultation</p>
                  <p className="text-sm text-gray-600">Room: {consult.room_id}</p>
                </div>
                <button
                  onClick={() => endConsultation(consult.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  End Consultation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Consultations

