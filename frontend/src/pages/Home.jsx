import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'
import { FiArrowRight, FiShoppingCart, FiZap, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get('/api/categories/all'),
          API.get('/products')
        ])
        setCategories(catRes.data.slice(0, 8))
        setFeaturedProducts(prodRes.data.slice(0, 8))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categoryIcons = ['📱', '💻', '🎧', '⌚', '📺', '📷', '🎮', '🔋']

  return (
    <div className="bg-gray-950">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 rounded-full px-4 py-2 mb-6">
              <FiZap className="text-red-500" />
              <span className="text-red-400 text-sm font-medium">New Arrivals Available</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Next-Gen <span className="text-red-500">Electronics</span> At Your Fingertips
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Discover the latest smartphones, laptops, gaming gear and more. Premium electronics at the best prices in Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center gap-2"
              >
                Shop Now <FiArrowRight />
              </Link>
              <Link
                to="/contact"
                className="border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-40 w-48 h-48 bg-red-600/5 rounded-full blur-2xl"></div>
      </section>

      {/* Features Bar */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders over LKR 10,000' },
              { icon: <FiShield />, title: 'Warranty', desc: '1 year on all products' },
              { icon: <FiZap />, title: 'Fast Shipping', desc: 'Same day in Jaffna' },
              { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Always here to help' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-red-600/20 text-red-500 p-3 rounded-xl text-xl">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-gray-500 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Shop by Category</h2>
            <p className="text-gray-400 mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 rounded-xl p-4 text-center transition-all group"
            >
              <div className="text-3xl mb-2">{categoryIcons[i] || '📦'}</div>
              <p className="text-gray-300 group-hover:text-white text-xs font-medium leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Featured Products</h2>
            <p className="text-gray-400 mt-1">Handpicked just for you</p>
          </div>
          <Link to="/products" className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm">
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 rounded-xl overflow-hidden transition-all group"
              >
                <div className="aspect-square bg-gray-800 overflow-hidden">
                  <img
                    src={`http://localhost:8080/images/products/${product.frontImage}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300/1f2937/6b7280?text=No+Image' }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-xs mb-1">{product.category?.name}</p>
                  <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-red-500 font-bold">LKR {product.price?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-red-900/40 to-gray-900 border border-red-900/50 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Shop?</h2>
          <p className="text-gray-400 mb-6">Browse our full collection of premium electronics</p>
          <Link
            to="/products"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <FiShoppingCart /> Browse All Products
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Home