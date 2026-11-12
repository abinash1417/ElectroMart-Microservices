import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi'

const WishlistPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    try {
      const res = await API.get(`/api/wishlist/${user.id}`)
      setWishlist(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await API.delete('/api/wishlist/remove', {
        data: { userId: user.id, productId }
      })
      setWishlist(prev => prev.filter(p => p.id !== productId))
      toast.success('Removed from wishlist!')
      window.dispatchEvent(new Event('wishlistUpdated'))
    } catch (err) {
      toast.error('Failed to remove!')
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await API.post('/api/cart/add', {
        userId: user.id,
        productId: product.id,
        quantity: 1
      })
      toast.success('Added to cart!')
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      toast.error('Failed to add to cart!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="text-red-500 text-3xl" />
          <div>
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            <p className="text-gray-400">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="text-gray-700 text-6xl mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save products you love by clicking the heart icon</p>
            <Link to="/products"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <div key={product.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all">
                <Link to={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-800 overflow-hidden">
                    <img
                      src={`http://localhost:8080/images/products/${product.frontImage}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300/1f2937/6b7280?text=No+Image' }}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-gray-500 text-xs mb-1">{product.category?.name}</p>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-white font-semibold text-sm leading-tight mb-3 line-clamp-2 hover:text-red-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-red-500 font-bold mb-4">LKR {product.price?.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FiShoppingCart />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="p-2 bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage