import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiMessageSquare, FiCheck } from 'react-icons/fi'
import { format } from 'date-fns'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [response, setResponse] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/api/admin/complaints')
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    }
  }

  const resolveComplaint = async (id) => {
    if (!response.trim()) {
      alert('Please provide a response')
      return
    }
    try {
      await axios.put(`/api/admin/complaints/${id}/resolve`, null, {
        params: { admin_response: response },
      })
      setSelectedComplaint(null)
      setResponse('')
      fetchComplaints()
    } catch (error) {
      alert('Error resolving complaint')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600 mt-2">Handle user complaints and feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Complaint List</h2>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => setSelectedComplaint(complaint)}
                className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedComplaint?.id === complaint.id ? 'border-primary-500 bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{complaint.subject}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {selectedComplaint ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <div>
                <p className="font-medium">Subject</p>
                <p className="text-gray-700">{selectedComplaint.subject}</p>
              </div>
              <div>
                <p className="font-medium">Description</p>
                <p className="text-gray-700">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.admin_response && (
                <div>
                  <p className="font-medium">Admin Response</p>
                  <p className="text-gray-700">{selectedComplaint.admin_response}</p>
                </div>
              )}
              {selectedComplaint.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="4"
                  />
                  <button
                    onClick={() => resolveComplaint(selectedComplaint.id)}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FiCheck className="mr-2" />
                    Resolve Complaint
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <FiMessageSquare className="text-4xl mx-auto mb-4 text-gray-400" />
              <p>Select a complaint to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Complaints

