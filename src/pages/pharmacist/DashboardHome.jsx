import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiPackage, FiShoppingCart, FiAlertCircle, FiDollarSign } from 'react-icons/fi'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    inventory: 0,
    lowStock: 0,
    orders: 0,
    revenue: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [inventoryRes, lowStockRes, ordersRes] = await Promise.all([
        axios.get('/api/inventory/'),
        axios.get('/api/inventory/low-stock'),
        axios.get('/api/pharmacists/orders'),
      ])
      setStats({
        inventory: inventoryRes.data.length,
        lowStock: lowStockRes.data.length,
        orders: ordersRes.data?.length || 0,
        revenue: 0, // Calculate from orders
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pharmacist Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your pharmacy operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inventory Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inventory}</p>
            </div>
            <FiPackage className="text-primary-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStock}</p>
            </div>
            <FiAlertCircle className="text-red-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
            </div>
            <FiShoppingCart className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.revenue}</p>
            </div>
            <FiDollarSign className="text-yellow-600 text-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

