import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiShoppingCart, FiPlus } from 'react-icons/fi'
import { format } from 'date-fns'

const MedicineOrdering = () => {
  const [orders, setOrders] = useState([])
  const [pharmacists, setPharmacists] = useState([])
  const [inventory, setInventory] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedPharmacist, setSelectedPharmacist] = useState('')
  const [cart, setCart] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchPharmacists()
  }, [])

  useEffect(() => {
    if (selectedPharmacist) {
      fetchInventory()
    }
  }, [selectedPharmacist])

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/medicines/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchPharmacists = async () => {
    try {
      const response = await axios.get('/api/pharmacists/list')
      setPharmacists(response.data)
    } catch (error) {
      console.error('Error fetching pharmacists:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`/api/inventory/?pharmacist_id=${selectedPharmacist}`)
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(c => c.id !== id))
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity } : c))
    }
  }

  const handleOrder = async () => {
    if (!selectedPharmacist || cart.length === 0 || !deliveryAddress) {
      alert('Please select pharmacist, add items to cart, and provide delivery address')
      return
    }

    try {
      await axios.post('/api/medicines/order', {
        pharmacist_id: parseInt(selectedPharmacist),
        delivery_address: deliveryAddress,
        order_items: cart.map(item => ({
          inventory_item_id: item.id,
          quantity: item.quantity,
        })),
      })
      setShowModal(false)
      setCart([])
      setDeliveryAddress('')
      fetchOrders()
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.detail || error.message))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Ordering</h1>
          <p className="text-gray-600 mt-2">Order medicines from verified pharmacies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          New Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Pharmacy {order.pharmacist_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Place Order</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Pharmacy</label>
              <select
                value={selectedPharmacist}
                onChange={(e) => setSelectedPharmacist(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a pharmacy</option>
                {pharmacists.map((pharma) => (
                  <option key={pharma.id} value={pharma.id}>
                    {pharma.pharmacy_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPharmacist && (
              <>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Available Medicines</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                    {inventory.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price}</p>
                        <p className="text-xs text-gray-500">Stock: {item.stock_quantity}</p>
                        <button
                          onClick={() => addToCart(item)}
                          className="mt-2 w-full bg-primary-600 text-white text-sm py-1 rounded hover:bg-primary-700"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Cart</h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500">Cart is empty</p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border rounded p-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">${item.price} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="font-bold mt-2">
                        Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleOrder}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                  >
                    Place Order
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setCart([])
                      setSelectedPharmacist('')
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineOrdering

