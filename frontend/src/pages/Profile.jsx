import { useState, useEffect } from 'react'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPackage, FiClock, FiXCircle, FiAlertTriangle } from 'react-icons/fi'

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery time too long',
  'Product no longer needed',
  'Other'
]

const STATUS_COLORS = {
  PAID:           'bg-green-900/50 text-green-400',
  PENDING:        'bg-yellow-900/50 text-yellow-400',
  PROCESSING:     'bg-blue-900/50 text-blue-400',
  SHIPPED:        'bg-purple-900/50 text-purple-400',
  DELIVERED:      'bg-teal-900/50 text-teal-400',
  CANCELLED:      'bg-red-900/50 text-red-400',
  REFUND_PENDING: 'bg-orange-900/50 text-orange-400',
  REFUNDED:       'bg-green-900/50 text-green-300',
}

const STATUS_STEPS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const Profile = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Cancel modal states
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])
  const [cancelCustomReason, setCancelCustomReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await API.get(`/api/orders/user/${user.id}`)
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId)
    setCancelReason(CANCEL_REASONS[0])
    setCancelCustomReason('')
    setCancelModal(true)
  }

  const handleCancelOrder = async () => {
    const finalReason = cancelReason === 'Other' ? cancelCustomReason : cancelReason
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }
    setCancelling(true)
    try {
      await API.post(`/api/orders/${cancelOrderId}/cancel`, {
        userId: user.id,
        reason: finalReason
      })
      toast.success('Order cancelled! Refund email sent 📧')
      setCancelModal(false)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = (status) =>
    ['PENDING', 'PAID', 'PROCESSING'].includes(status)

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status)

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <FiMail className="text-sm" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {user?.roles?.map(role => (
                  <span key={role} className={`text-xs px-2 py-1 rounded-full ${role === 'ROLE_ADMIN' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 Customer'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiPackage className="text-red-500" /> My Orders
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-xl h-32 animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
              <FiPackage className="text-gray-700 text-6xl mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No orders yet!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-bold">Order #{order.id}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <FiClock />
                        <span>{new Date(order.orderDate).toLocaleDateString('en-LK', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-800 text-gray-400'}`}>
                        {order.status}
                      </span>
                      <p className="text-red-500 font-bold">LKR {order.totalAmount?.toLocaleString()}</p>
                      {canCancel(order.status) && (
                        <button
                          onClick={() => openCancelModal(order.id)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FiXCircle /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Progress Bar (only for non-cancelled orders) */}
                  {!['CANCELLED', 'REFUND_PENDING', 'REFUNDED'].includes(order.status) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div className={`w-3 h-3 rounded-full mb-1 ${i <= getStepIndex(order.status) ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                            <span className={`text-xs ${i <= getStepIndex(order.status) ? 'text-red-400' : 'text-gray-600'}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="w-full bg-gray-700 h-1 rounded-full">
                        <div
                          className="bg-red-500 h-1 rounded-full transition-all"
                          style={{ width: `${Math.max(5, (getStepIndex(order.status) / (STATUS_STEPS.length - 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation info */}
                  {order.status === 'CANCELLED' && order.cancellationReason && (
                    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-xs font-medium">Cancellation Reason</p>
                      <p className="text-gray-300 text-sm mt-1">{order.cancellationReason}</p>
                      <p className="text-green-400 text-xs mt-1">✓ Refund will be processed in 3-5 business days</p>
                    </div>
                  )}

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="border-t border-gray-800 pt-4 space-y-2">
                      {order.orderItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                            <FiPackage className="text-gray-500" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-gray-300 text-sm">{item.product?.name}</p>
                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-white text-sm">LKR {item.price?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600/20 border border-red-600/40 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Cancel Order #{cancelOrderId}</h2>
                <p className="text-gray-400 text-sm">A refund email will be sent to you</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  {CANCEL_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Please describe</label>
                  <textarea
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="Tell us more..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
              )}

              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-3">
                <p className="text-yellow-400 text-xs">⚠️ This action cannot be undone. Your refund will be processed in 3-5 business days.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {cancelling
                    ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    : <><FiXCircle /> Cancel Order</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile