import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi'

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    try {
      const res = await API.get(`/api/cart/user/${user.id}`)
      setCart(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

const handleRemove = async (cartItemId) => {
  try {
    await API.delete(`/api/cart/remove/${cartItemId}`)
    toast.success('Item removed!')
    const res = await API.get(`/api/cart/user/${user.id}`)
    setCart(res.data)
    window.dispatchEvent(new Event('cartUpdated'))
  } catch (err) {
    console.error('Remove error:', err)
    toast.error('Failed to remove item!')
  }
}

  const handleClear = async () => {
    try {
      await API.delete(`/api/cart/clear/${cart.id}`)
      toast.success('Cart cleared!')
      setCart({ ...cart, cartItems: [] })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      toast.error('Failed to clear cart!')
    }
  }

  const total = cart?.cartItems?.reduce((sum, item) => {
    return sum + (item.product?.price * item.quantity)
  }, 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FiShoppingCart className="text-red-500" /> My Cart
        </h1>

        {!cart?.cartItems?.length ? (
          <div className="text-center py-20">
            <FiShoppingCart className="text-gray-700 text-8xl mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-4">Your cart is empty!</p>
            <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.cartItems.map(item => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                  <img
                    src={`http://localhost:8080/images/products/${item.product?.frontImage}`}
                    alt={item.product?.name}
                    className="w-20 h-20 object-contain bg-gray-800 rounded-lg p-2"
                    onError={(e) => { e.target.src = 'https://placehold.co/80x80/1f2937/6b7280?text=No+Image' }}
                  />
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold text-sm">{item.product?.name}</h3>
                    <p className="text-red-500 font-bold mt-1">LKR {item.product?.price?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold mb-2">
                      LKR {(item.product?.price * item.quantity)?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleClear}
                className="text-gray-500 hover:text-red-500 text-sm transition-colors flex items-center gap-2"
              >
                <FiTrash2 /> Clear entire cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {cart.cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate mr-2">{item.product?.name} x{item.quantity}</span>
                      <span className="text-white whitespace-nowrap">LKR {(item.product?.price * item.quantity)?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-red-500 font-bold text-xl">LKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart