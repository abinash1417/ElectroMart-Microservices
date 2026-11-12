import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API from '../services/api'
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi'
import { useCompare } from '../context/CompareContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PRODUCTS_PER_PAGE = 12

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchParams] = useSearchParams()
  const [wishlistItems, setWishlistItems] = useState([])
  const { addToCompare, isInCompare } = useCompare()
  const { user } = useAuth()

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl)

    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get('/api/categories/all'),
          API.get('/products')
        ])
        setCategories(catRes.data)
        setProducts(prodRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
  if (user && user.id) {
    API.get(`/api/wishlist/${user.id}`)
        .then(res => setWishlistItems(res.data.map(p => p.id)))
        .catch(err => console.error(err))
    }
  }, [user])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory])

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to add to wishlist!'); return; }
    try {
      await API.post('/api/wishlist/toggle', { userId: user.id, productId: product.id })
      const isWishlisted = wishlistItems.includes(product.id)
      setWishlistItems(prev =>
        isWishlisted ? prev.filter(id => id !== product.id) : [...prev, product.id]
      )
      window.dispatchEvent(new Event('wishlistUpdated'))
      toast.success(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist! ❤️')
    } catch (err) {
      toast.error('Failed to update wishlist!')
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory ? p.category?.id === parseInt(selectedCategory) : true
    return matchSearch && matchCategory
  })

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Products</h1>
          <p className="text-gray-400">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filtered.length)} of {filtered.length} products
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === '' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === String(cat.id) ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-72 animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No products found</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('') }} className="mt-4 text-red-500 hover:text-red-400">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginated.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 rounded-xl overflow-hidden transition-all group"
                >
                  <div className="aspect-square bg-gray-800 overflow-hidden relative">
                    <img
                      src={`http://localhost:8080/images/products/${product.frontImage}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300/1f2937/6b7280?text=No+Image' }}
                    />
                    <button
                      onClick={(e) => handleWishlistToggle(e, product)}
                      className="absolute top-2 right-2 p-1.5 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <FiHeart className={`text-sm ${wishlistItems.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-xs mb-1">{product.category?.name}</p>
                    <h3 className="text-white font-semibold text-sm leading-tight mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-red-500 font-bold text-sm">LKR {product.price?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); addToCompare(product); }}
                      className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${
                        isInCompare(product.id)
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-transparent border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400'
                      }`}
                    >
                      {isInCompare(product.id) ? '✓ Added to Compare' : '⚡ Add to Compare'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <FiChevronLeft /> Prev
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-red-500'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="text-gray-600">...</span>
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products