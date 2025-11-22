import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiTrendingUp, FiActivity, FiCalendar } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const HealthInsights = () => {
  const [insights, setInsights] = useState(null)
  const [trackerData, setTrackerData] = useState([])

  useEffect(() => {
    fetchInsights()
    fetchTrackerData()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/api/analytics/patient/health-insights')
      setInsights(response.data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    }
  }

  const fetchTrackerData = async () => {
    try {
      const response = await axios.get('/api/health-tracker/')
      // Group by metric type and prepare chart data
      const grouped = {}
      response.data.forEach(entry => {
        if (!grouped[entry.metric_type]) {
          grouped[entry.metric_type] = []
        }
        grouped[entry.metric_type].push({
          date: new Date(entry.recorded_at).toLocaleDateString(),
          value: entry.value,
        })
      })
      setTrackerData(grouped)
    } catch (error) {
      console.error('Error fetching tracker data:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Insights</h1>
        <p className="text-gray-600 mt-2">Analytics and recommendations for your health</p>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FiCalendar className="text-primary-600 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Recent Appointments</p>
                <p className="text-2xl font-bold">{insights.recent_appointments_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FiActivity className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Health Entries</p>
                <p className="text-2xl font-bold">{insights.health_tracker_entries_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Recommendations</p>
                <p className="text-2xl font-bold">{insights.recommendations.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Health Trends</h2>
        {Object.keys(trackerData).length === 0 ? (
          <p className="text-gray-500">No health tracker data available</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(trackerData).map(([metric, data]) => (
              <div key={metric}>
                <h3 className="font-medium mb-2 capitalize">{metric.replace('_', ' ')}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </div>

      {insights && insights.recommendations && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Health Recommendations</h2>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default HealthInsights

