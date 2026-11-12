import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiCreditCard, FiLock } from 'react-icons/fi'

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await API.get(`/api/cart/user/${user.id}`)
        setCart(res.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchCart()
  }, [])

  const total = cart?.cartItems?.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0) || 0

  const handlePlaceOrder = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      toast.error('Please enter a valid 16-digit card number!')
      return
    }
    setPlacing(true)
    try {
      const orderRes = await API.post('/api/orders/create', { userId: user.id })
      const orderId = orderRes.data.id
      await API.post('/api/payments/make', { orderId, cardNumber, paymentMethod, amount: total })
      if (cart?.id) await API.delete(`/api/cart/clear/${cart.id}`)
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success('Order placed! Check your email for delivery confirmation code 📧')
      navigate('/profile')
    } catch (err) {
      const status = err.response?.status ? `[HTTP ${err.response.status}] ` : ''
      const msg = status + (err.response?.data?.message || err.message || 'Failed to place order!')
      toast.error(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
    </div>
  )

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FiCreditCard className="text-red-500" /> Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Payment Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <FiLock className="text-red-500" /> Payment Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CREDIT_CARD', 'DEBIT_CARD', 'VISA'].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === method ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500'}`}>
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Card Number</label>
                <input type="text" value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors tracking-widest" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Expiry Date</label>
                  <input type="text" placeholder="MM / YY"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">CVV</label>
                  <input type="text" placeholder="•••" maxLength={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Cardholder Name</label>
                <input type="text" defaultValue={user?.name} placeholder="John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <FiLock /> Your payment info is secure and encrypted
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-4">
              <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart?.cartItems?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={`http://localhost:8080/images/products/${item.product?.frontImage}`} alt={item.product?.name}
                      className="w-12 h-12 object-contain bg-gray-800 rounded-lg p-1"
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48/1f2937/6b7280?text=?' }} />
                    <div className="flex-grow">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm font-semibold">LKR {(item.product?.price * item.quantity)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">LKR {total.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery</span><span className="text-green-400">Free</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700"><span className="text-white">Total</span><span className="text-red-500">LKR {total.toLocaleString()}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing || !cart?.cartItems?.length}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
                {placing
                  ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  : <><FiLock /> Place Order — LKR {total.toLocaleString()}</>}
              </button>
              <p className="text-gray-500 text-xs text-center mt-2">A delivery confirmation code will be sent to your email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout