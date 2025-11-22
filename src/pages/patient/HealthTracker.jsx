import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'

const HealthTracker = () => {
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    metric_type: 'weight',
    value: '',
    unit: '',
    notes: '',
    recorded_at: new Date().toISOString().slice(0, 16),
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/health-tracker/')
      setEntries(response.data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/health-tracker/', {
        ...formData,
        value: parseFloat(formData.value),
        recorded_at: new Date(formData.recorded_at).toISOString(),
      })
      setShowModal(false)
      setFormData({
        metric_type: 'weight',
        value: '',
        unit: '',
        notes: '',
        recorded_at: new Date().toISOString().slice(0, 16),
      })
      fetchEntries()
    } catch (error) {
      alert('Error adding entry: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/api/health-tracker/${id}`)
        fetchEntries()
      } catch (error) {
        alert('Error deleting entry')
      }
    }
  }

  const metricTypes = [
    { value: 'weight', label: 'Weight' },
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'glucose', label: 'Blood Glucose' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'temperature', label: 'Temperature' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
          <p className="text-gray-600 mt-2">Track your health metrics over time</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Entry
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{entry.metric_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.value} {entry.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(entry.recorded_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">{entry.notes || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Health Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                <select
                  value={formData.metric_type}
                  onChange={(e) => setFormData({ ...formData, metric_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {metricTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, mmHg, mg/dL, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.recorded_at}
                  onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  Add Entry
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

export default HealthTracker

