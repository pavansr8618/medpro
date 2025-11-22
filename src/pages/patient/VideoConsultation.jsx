import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiVideo, FiPhone } from 'react-icons/fi'
import { format } from 'date-fns'

const VideoConsultation = () => {
  const [consultations, setConsultations] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    fetchConsultations()
    fetchAppointments()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/api/consultations/patient')
      setConsultations(response.data)
    } catch (error) {
      console.error('Error fetching consultations:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/patient')
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
      // In a real app, this would open a video/audio call interface
      alert(`Consultation room created: ${roomId}\n\nIn a production app, this would open the ${type} call interface.`)
    } catch (error) {
      alert('Error starting consultation: ' + (error.response?.data?.detail || error.message))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Consultation</h1>
        <p className="text-gray-600 mt-2">Start video or audio consultations with your doctors</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Available Appointments</h2>
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
                    Video Call
                  </button>
                  <button
                    onClick={() => startConsultation(apt.id, 'audio')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FiPhone className="mr-2" />
                    Audio Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Consultation History</h2>
        {consultations.length === 0 ? (
          <p className="text-gray-500">No consultations yet</p>
        ) : (
          <div className="space-y-4">
            {consultations.map((consult) => (
              <div key={consult.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{consult.consultation_type} Consultation</p>
                    <p className="text-sm text-gray-600">Room ID: {consult.room_id}</p>
                    {consult.start_time && (
                      <p className="text-xs text-gray-500">
                        Started: {format(new Date(consult.start_time), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                  {consult.recording_url && (
                    <a
                      href={consult.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View Recording
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoConsultation

