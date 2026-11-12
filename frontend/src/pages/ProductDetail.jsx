import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiArrowLeft, FiStar, FiHeart } from 'react-icons/fi'

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCompare, isInCompare } = useCompare()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setAddedToCart(false)
      setQuantity(1)
      try {
        const [prodRes, reviewRes, allProdRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/api/reviews/product/${id}`),
          API.get('/products')
        ])
        const currentProduct = prodRes.data
        setProduct(currentProduct)
        setReviews(reviewRes.data)
        const related = allProdRes.data
          .filter(p => p.category?.id === currentProduct.category?.id && p.id !== currentProduct.id)
          .slice(0, 4)
        setRelatedProducts(related)

        if (user && user.id) {
          const wishlistRes = await API.get(`/api/wishlist/check/${user.id}/${id}`)
          setInWishlist(wishlistRes.data.inWishlist)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart!')
      navigate('/login')
      return
    }
    setAddingToCart(true)
    try {
      await API.post('/api/cart/add', {
        userId: user.id,
        productId: product.id,
        quantity
      })
      toast.success('Added to cart!')
      window.dispatchEvent(new Event('cartUpdated'))
      setAddedToCart(true)
    } catch (err) {
      toast.error('Failed to add to cart!')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) { toast.error('Please login!'); navigate('/login'); return; }
    try {
      await API.post('/api/wishlist/toggle', { userId: user.id, productId: product.id })
      setInWishlist(prev => !prev)
      window.dispatchEvent(new Event('wishlistUpdated'))
      toast.success(inWishlist ? 'Removed from wishlist!' : 'Added to wishlist! ❤️')
    } catch (err) {
      toast.error('Failed to update wishlist!')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to submit a review!')
      return
    }
    setSubmittingReview(true)
    try {
      await API.post('/api/reviews/add', {
        userId: user.id,
        productId: product.id,
        rating,
        comment
      })
      toast.success('Review submitted! ⭐')
      setComment('')
      setRating(5)
      const reviewRes = await API.get(`/api/reviews/product/${id}`)
      setReviews(reviewRes.data)
    } catch (err) {
      toast.error('Failed to submit review!')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-xl">Product not found!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex items-center justify-center aspect-square">
            <img
              src={`http://localhost:8080/images/products/${product.frontImage}`}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500/1f2937/6b7280?text=No+Image' }}
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-red-500 text-sm font-medium mb-2">{product.category?.name}</p>

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border transition-colors flex-shrink-0 ${
                  inWishlist
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400'
                }`}
              >
                <FiHeart className={inWishlist ? 'fill-white' : ''} />
              </button>
            </div>

            <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-4xl font-bold text-red-500">LKR {product.price?.toLocaleString()}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && !addedToCart && (
              <div className="flex items-center gap-4 mb-6">
                <p className="text-gray-400 text-sm">Quantity:</p>
                <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-white text-xl font-bold">-</button>
                  <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-white text-xl font-bold">+</button>
                </div>
              </div>
            )}

            {!addedToCart ? (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
              >
                {addingToCart
                  ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  : <><FiShoppingCart /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</>}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-green-900/30 border border-green-700 rounded-xl py-3 px-4 flex items-center justify-center">
                  <span className="text-green-400 font-semibold">✓ Added to Cart!</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setAddedToCart(false); navigate(-1) }}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <FiArrowLeft /> Continue Shopping
                  </button>
                  <button onClick={() => navigate('/checkout')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <FiShoppingCart /> Go to Checkout
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => addToCompare(product)}
              className={`mt-3 w-full py-3 rounded-xl border font-semibold transition-colors flex items-center justify-center gap-2 ${
                isInCompare(product.id)
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-transparent border-gray-700 text-gray-300 hover:border-red-500 hover:text-red-400'
              }`}
            >
              {isInCompare(product.id) ? '✓ Added to Compare' : '⚡ Add to Compare'}
            </button>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-800 pt-12 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Related Products</h2>
              <Link to={`/products?category=${product.category?.id}`} className="text-red-500 hover:text-red-400 text-sm transition-colors">
                View all {product.category?.name} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <Link key={related.id} to={`/products/${related.id}`}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 rounded-xl overflow-hidden transition-all group">
                  <div className="aspect-square bg-gray-800 overflow-hidden">
                    <img
                      src={`http://localhost:8080/images/products/${related.frontImage}`}
                      alt={related.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300/1f2937/6b7280?text=No+Image' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">{related.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-red-500 font-bold text-sm">LKR {related.price?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${related.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {related.stock > 0 ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8">Customer Reviews ({reviews.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold">{review.user?.name || 'Anonymous'}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            {user && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)} className="text-2xl transition-colors">
                          <FiStar className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      required
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                    />
                  </div>
                  <button type="submit" disabled={submittingReview}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {submittingReview
                      ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetail