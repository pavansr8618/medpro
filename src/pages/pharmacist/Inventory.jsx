import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'

const Inventory = () => {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    barcode: '',
    category: '',
    stock_quantity: 0,
    min_stock_level: 10,
    price: 0,
    expiry_date: '',
    manufacturer: '',
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/inventory/')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleBarcodeScan = async () => {
    if (!barcode) return
    try {
      const response = await axios.get(`/api/inventory/barcode/${barcode}`)
      setEditingItem(response.data)
      setFormData({
        name: response.data.name,
        generic_name: response.data.generic_name || '',
        barcode: response.data.barcode || '',
        category: response.data.category || '',
        stock_quantity: response.data.stock_quantity,
        min_stock_level: response.data.min_stock_level,
        price: response.data.price,
        expiry_date: response.data.expiry_date ? new Date(response.data.expiry_date).toISOString().slice(0, 10) : '',
        manufacturer: response.data.manufacturer || '',
      })
      setShowModal(true)
      setBarcode('')
    } catch (error) {
      alert('Item not found. You can add a new item.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await axios.put(`/api/inventory/${editingItem.id}`, {
          ...formData,
          expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        })
      } else {
        await axios.post('/api/inventory/', {
          ...formData,
          expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        })
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        generic_name: '',
        barcode: '',
        category: '',
        stock_quantity: 0,
        min_stock_level: 10,
        price: 0,
        expiry_date: '',
        manufacturer: '',
      })
      fetchItems()
    } catch (error) {
      alert('Error saving item: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/inventory/${id}`)
        fetchItems()
      } catch (error) {
        alert('Error deleting item')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage your pharmacy inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">Barcode Scanner</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or enter barcode"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
          />
          <button
            onClick={handleBarcodeScan}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
          >
            <FiSearch className="mr-2" />
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className={item.stock_quantity <= item.min_stock_level ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.generic_name && (
                        <p className="text-sm text-gray-500">{item.generic_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={item.stock_quantity <= item.min_stock_level ? 'text-red-600 font-bold' : ''}>
                      {item.stock_quantity}
                    </span>
                    {item.stock_quantity <= item.min_stock_level && (
                      <span className="ml-2 text-xs text-red-600">(Low Stock)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setFormData({
                            name: item.name,
                            generic_name: item.generic_name || '',
                            barcode: item.barcode || '',
                            category: item.category || '',
                            stock_quantity: item.stock_quantity,
                            min_stock_level: item.min_stock_level,
                            price: item.price,
                            expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().slice(0, 10) : '',
                            manufacturer: item.manufacturer || '',
                          })
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name</label>
                  <input
                    type="text"
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                  }}
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

export default Inventory

