import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiFileText, FiActivity } from 'react-icons/fi'

const PatientHistory = () => {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientHistory()
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      const appointmentsRes = await axios.get('/api/appointments/doctor')
      const patientIds = [...new Set(appointmentsRes.data.map(a => a.patient_id))]
      setPatients(patientIds.map(id => ({ id })))
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchPatientHistory = async () => {
    try {
      const [prescriptionsRes, recordsRes] = await Promise.all([
        axios.get(`/api/prescriptions/patient/${selectedPatient}`),
        axios.get(`/api/health-records/?patient_id=${selectedPatient}`),
      ])
      setHistory({
        prescriptions: prescriptionsRes.data,
        records: recordsRes.data,
      })
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
        <p className="text-gray-600 mt-2">View patient medical history and records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Patients</h2>
          <div className="space-y-2">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedPatient === patient.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Patient #{patient.id}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {!selectedPatient ? (
            <p className="text-gray-500">Select a patient to view history</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FiFileText className="mr-2" />
                  Prescriptions
                </h3>
                {history?.prescriptions.length === 0 ? (
                  <p className="text-gray-500">No prescriptions</p>
                ) : (
                  <div className="space-y-2">
                    {history?.prescriptions.map((pres) => (
                      <div key={pres.id} className="border rounded p-3">
                        <p className="font-medium">{pres.diagnosis}</p>
                        <p className="text-sm text-gray-600">
                          {pres.medications.length} medication(s)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FiActivity className="mr-2" />
                  Health Records
                </h3>
                {history?.records.length === 0 ? (
                  <p className="text-gray-500">No health records</p>
                ) : (
                  <div className="space-y-2">
                    {history?.records.map((record) => (
                      <div key={record.id} className="border rounded p-3">
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-gray-600 capitalize">{record.record_type}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientHistory

