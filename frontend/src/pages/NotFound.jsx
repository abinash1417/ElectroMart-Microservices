import { Link } from 'react-router-dom'
import { FiHome, FiZap } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FiZap className="text-red-500 text-3xl" />
          <span className="text-3xl font-bold text-white">
            Electro<span className="text-red-500">Mart</span>
          </span>
        </div>

        <h1 className="text-9xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <FiHome /> Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound