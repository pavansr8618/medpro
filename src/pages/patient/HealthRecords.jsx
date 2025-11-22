import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiPlus, FiTrash2, FiFile } from 'react-icons/fi'
import { format } from 'date-fns'

const HealthRecords = () => {
  const [records, setRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    record_type: 'prescription',
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    doctor_name: '',
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/health-records/')
      setRecords(response.data)
    } catch (error) {
      console.error('Error fetching records:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/health-records/', {
        ...formData,
        date: new Date(formData.date).toISOString(),
      })
      setShowModal(false)
      setFormData({
        record_type: 'prescription',
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        doctor_name: '',
      })
      fetchRecords()
    } catch (error) {
      alert('Error adding record: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`/api/health-records/${id}`)
        fetchRecords()
      } catch (error) {
        alert('Error deleting record')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600 mt-2">Manage your medical records and documents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FiFile className="text-primary-600 text-2xl mr-3" />
                <div>
                  <h3 className="font-bold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{record.record_type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(record.id)}
                className="text-red-600 hover:text-red-800"
              >
                <FiTrash2 />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-2">{record.description || 'No description'}</p>
            <div className="text-xs text-gray-500">
              <p>Date: {format(new Date(record.date), 'MMM dd, yyyy')}</p>
              {record.doctor_name && <p>Doctor: {record.doctor_name}</p>}
            </div>
            {record.file_url && (
              <a
                href={record.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 text-sm mt-2 inline-block"
              >
                View File
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Health Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                <select
                  value={formData.record_type}
                  onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="prescription">Prescription</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="xray">X-Ray</option>
                  <option value="scan">Scan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                <input
                  type="text"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  Add Record
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

export default HealthRecords

