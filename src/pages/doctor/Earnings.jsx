import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiDollarSign } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Earnings = () => {
  const [earnings, setEarnings] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const response = await axios.get('/api/analytics/doctor/earnings')
      setEarnings(response.data)
      
      // Prepare chart data
      const grouped = {}
      response.data.earnings.forEach(e => {
        const date = new Date(e.date).toLocaleDateString()
        if (!grouped[date]) {
          grouped[date] = 0
        }
        grouped[date] += e.amount
      })
      setChartData(Object.entries(grouped).map(([date, amount]) => ({ date, amount })))
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings Analytics</h1>
        <p className="text-gray-600 mt-2">Track your earnings and revenue</p>
      </div>

      {earnings && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <FiDollarSign className="text-yellow-600 text-3xl mr-3" />
            <div>
              <p className="text-gray-600 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">${earnings.total_earnings.toFixed(2)}</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">Earnings Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Recent Earnings</h3>
            <div className="space-y-2">
              {earnings.earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <p className="font-medium capitalize">{earning.source}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(earning.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">${earning.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Earnings

