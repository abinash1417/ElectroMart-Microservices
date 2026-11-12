import { useState, useEffect } from 'react'
import API from '../services/api'
import toast from 'react-hot-toast'
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiPackage,
  FiMail, FiTrash2, FiCheck
} from 'react-icons/fi'
import { MdAdminPanelSettings } from 'react-icons/md'

const AddProductForm = ({ onProductAdded }) => {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', frontImage: '', categoryId: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    API.get('/api/categories/all').then(res => setCategories(res.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/api/admin/products', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        frontImage: form.frontImage,
        categoryId: parseInt(form.categoryId)      })
      toast.success('Product added!')
      setForm({ name: '', description: '', price: '', stock: '', frontImage: '', categoryId: '' })
      onProductAdded()
    } catch (err) {
      toast.error('Failed to add product!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-white font-bold text-lg mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price (LKR)" type="number" required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
        <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
        <input name="frontImage" value={form.frontImage} onChange={handleChange} placeholder="Image filename (e.g. st1.png)" required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
        <button type="submit" disabled={loading}
          className="md:col-span-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : '+ Add Product'}
        </button>
      </form>
    </div>
  )
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/api/admin/dashboard')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const res = await API.get('/api/admin/users')
    setUsers(res.data)
  }

  const fetchOrders = async () => {
    const res = await API.get('/api/admin/orders')
    setOrders(res.data)
  }

  const fetchProducts = async () => {
    const res = await API.get('/api/admin/products')
    setProducts(res.data)
  }

  const fetchContacts = async () => {
    const res = await API.get('/api/admin/contacts')
    setContacts(res.data)
  }

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    setLoading(true)
    try {
      if (tab === 'users') await fetchUsers()
      if (tab === 'orders') await fetchOrders()
      if (tab === 'products') await fetchProducts()
      if (tab === 'contacts') await fetchContacts()
    } catch (err) {
      toast.error('Failed to load data!')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await API.delete(`/api/admin/users/${id}`)
      toast.success('User deleted!')
      fetchUsers()
    } catch (err) {
      toast.error('Failed to delete user!')
    }
  }

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await API.put(`/api/admin/orders/${id}/status?status=${status}`)
      toast.success('Order status updated!')
      fetchOrders()
    } catch (err) {
      toast.error('Failed to update status!')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await API.delete(`/api/admin/products/${id}`)
      toast.success('Product deleted!')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to delete product!')
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/api/admin/contacts/${id}/read`)
      toast.success('Marked as read!')
      fetchContacts()
    } catch (err) {
      toast.error('Failed to mark as read!')
    }
  }

  const handleDeleteContact = async (id) => {
    try {
      await API.delete(`/api/admin/contacts/${id}`)
      toast.success('Message deleted!')
      fetchContacts()
    } catch (err) {
      toast.error('Failed to delete message!')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-900/50 text-green-400'
      case 'PENDING': return 'bg-yellow-900/50 text-yellow-400'
      case 'SHIPPED': return 'bg-blue-900/50 text-blue-400'
      case 'DELIVERED': return 'bg-purple-900/50 text-purple-400'
      case 'CANCELLED': return 'bg-red-900/50 text-red-400'
      default: return 'bg-gray-900/50 text-gray-400'
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdAdminPanelSettings /> },
    { id: 'orders', label: 'Orders', icon: <FiPackage /> },
    { id: 'products', label: 'Products', icon: <FiShoppingBag /> },
    { id: 'users', label: 'Users', icon: <FiUsers /> },
    { id: 'contacts', label: 'Messages', icon: <FiMail /> },
  ]

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <MdAdminPanelSettings className="text-yellow-400" /> Admin Panel
          </h1>
          <p className="text-gray-400 mt-1">Manage your ElectroMart store</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: 'text-blue-400' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: <FiPackage />, color: 'text-purple-400' },
                  { label: 'Total Products', value: stats.totalProducts, icon: <FiShoppingBag />, color: 'text-green-400' },
                  { label: 'Revenue', value: `LKR ${stats.totalRevenue?.toLocaleString()}`, icon: <FiDollarSign />, color: 'text-yellow-400' },
                  { label: 'Pending', value: stats.pendingOrders, icon: <FiPackage />, color: 'text-orange-400' },
                  { label: 'Paid', value: stats.paidOrders, icon: <FiCheck />, color: 'text-green-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className={`${stat.color} text-2xl mb-2`}>{stat.icon}</div>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm pb-3">Order ID</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Customer</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Amount</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Status</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Date</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="py-3 text-white text-sm">#{order.id}</td>
                        <td className="py-3 text-gray-300 text-sm">{order.user?.name}</td>
                        <td className="py-3 text-red-400 text-sm font-semibold">LKR {order.totalAmount?.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <select
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            defaultValue=""
                            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="" disabled>Update</option>
                            {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <AddProductForm onProductAdded={fetchProducts} />
                <div className="overflow-x-auto mt-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 text-sm pb-3">Product</th>
                        <th className="text-left text-gray-400 text-sm pb-3">Category</th>
                        <th className="text-left text-gray-400 text-sm pb-3">Price</th>
                        <th className="text-left text-gray-400 text-sm pb-3">Stock</th>
                        <th className="text-left text-gray-400 text-sm pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {products.map(product => (
                        <tr key={product.id}>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={`http://localhost:8080/images/products/${product.frontImage}`}
                                alt={product.name}
                                className="w-10 h-10 object-contain bg-gray-800 rounded-lg p-1"
                                onError={(e) => { e.target.src = 'https://placehold.co/40x40/1f2937/6b7280?text=?' }}
                              />
                              <span className="text-white text-sm">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-400 text-sm">{product.category?.name}</td>
                          <td className="py-3 text-red-400 text-sm">LKR {product.price?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                              {product.stock > 0 ? 'In Stock' : 'Out'}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 hover:text-red-400 transition-colors"
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
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm pb-3">ID</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Name</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Email</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Role</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="py-3 text-gray-400 text-sm">#{user.id}</td>
                        <td className="py-3 text-white text-sm">{user.name}</td>
                        <td className="py-3 text-gray-300 text-sm">{user.email}</td>
                        <td className="py-3">
                          {user.roles?.map(role => (
                            <span key={role.name} className={`text-xs px-2 py-1 rounded-full mr-1 ${role.name === 'ROLE_ADMIN' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'}`}>
                              {role.name === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                            </span>
                          ))}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No messages yet!</p>
                ) : (
                  contacts.map(contact => (
                    <div key={contact.id} className={`bg-gray-900 border rounded-xl p-5 ${!contact.read ? 'border-red-500/50' : 'border-gray-800'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-semibold">{contact.name}</p>
                            {!contact.read && (
                              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{contact.email}</p>
                          <p className="text-red-400 text-sm font-medium mt-2">{contact.subject}</p>
                          <p className="text-gray-300 text-sm mt-1">{contact.message}</p>
                          <p className="text-gray-600 text-xs mt-2">
                            {new Date(contact.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!contact.read && (
                            <button
                              onClick={() => handleMarkRead(contact.id)}
                              className="text-green-500 hover:text-green-400 transition-colors"
                            >
                              <FiCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard