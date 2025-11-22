import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiPlus, FiFileText } from 'react-icons/fi'
import { format } from 'date-fns'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '' }],
    instructions: '',
  })

  useEffect(() => {
    fetchPrescriptions()
    fetchPatients()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('/api/prescriptions/doctor')
      setPrescriptions(response.data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    }
  }

  const fetchPatients = async () => {
    // In a real app, fetch from appointments or patient list
    try {
      const appointmentsRes = await axios.get('/api/appointments/doctor')
      const patientIds = [...new Set(appointmentsRes.data.map(a => a.patient_id))]
      setPatients(patientIds.map(id => ({ id, name: `Patient #${id}` })))
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '' }],
    })
  }

  const updateMedication = (index, field, value) => {
    const updated = [...formData.medications]
    updated[index][field] = value
    setFormData({ ...formData, medications: updated })
  }

  const removeMedication = (index) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/prescriptions/', formData)
      setShowModal(false)
      setFormData({
        patient_id: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '' }],
        instructions: '',
      })
      fetchPrescriptions()
    } catch (error) {
      alert('Error creating prescription: ' + (error.response?.data?.detail || error.message))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Create and manage patient prescriptions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FiFileText className="text-primary-600 text-2xl mr-3" />
              <div>
                <h3 className="font-bold">Prescription #{prescription.id}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-2"><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
            <div className="mb-2">
              <strong>Medications:</strong>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {prescription.medications.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dosage} ({med.frequency})</li>
                ))}
              </ul>
            </div>
            {prescription.instructions && (
              <p className="text-sm text-gray-600"><strong>Instructions:</strong> {prescription.instructions}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Prescription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                {formData.medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedication}
                  className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Add Medication
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  Create Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prescriptions

