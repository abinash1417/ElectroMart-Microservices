import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiZap, FiHeart } from 'react-icons/fi'
import { MdAdminPanelSettings } from 'react-icons/md'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
  if (user && user.id) {
    fetchCartCount()
    fetchWishlistCount()
  } else {
      setCartCount(0)
      setWishlistCount(0)
    }

    const handleCartUpdate = () => { if (user) fetchCartCount() }
    const handleWishlistUpdate = () => { if (user) fetchWishlistCount() }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [user])

  const fetchCartCount = async () => {
    try {
      const res = await API.get(`/api/cart/user/${user.id}`)
      setCartCount(res.data?.cartItems?.length || 0)
    } catch (err) {
      setCartCount(0)
    }
  }

  const fetchWishlistCount = async () => {
    try {
      const res = await API.get(`/api/wishlist/${user.id}`)
      setWishlistCount(res.data?.length || 0)
    } catch (err) {
      setWishlistCount(0)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
    setCartCount(0)
    setWishlistCount(0)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <FiZap className="text-red-500 text-2xl" />
            <span className="text-xl font-bold text-white">
              Electro<span className="text-red-500">Mart</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-red-500 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-300 hover:text-red-500 transition-colors">Products</Link>
            <Link to="/contact" className="text-gray-300 hover:text-red-500 transition-colors">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin() && (
                  <Link to="/admin" className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors">
                    <MdAdminPanelSettings className="text-xl" />
                    <span className="text-sm">Admin</span>
                  </Link>
                )}

                <Link to="/wishlist" className="relative text-gray-300 hover:text-red-500 transition-colors">
                  <FiHeart className="text-xl" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative text-gray-300 hover:text-red-500 transition-colors">
                  <FiShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors">
                  <FiUser className="text-xl" />
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Login</Link>
                <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500">Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500">Products</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500">Contact</Link>
          {user ? (
            <>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500 flex items-center gap-2">
                Wishlist {wishlistCount > 0 && <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500 flex items-center gap-2">
                Cart {cartCount > 0 && <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500">Profile</Link>
              {isAdmin() && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-yellow-400">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-red-500">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar