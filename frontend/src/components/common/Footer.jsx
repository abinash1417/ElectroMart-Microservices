import { Link } from 'react-router-dom'
import { FiZap, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FiZap className="text-red-500 text-2xl" />
              <span className="text-xl font-bold text-white">
                Electro<span className="text-red-500">Mart</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted electronics store for the latest gadgets and technology at the best prices in Sri Lanka.
            </p>
            <div className="flex gap-4 mt-4">
              <FaFacebook className="text-gray-400 hover:text-red-500 cursor-pointer text-xl transition-colors" />
              <FaTwitter className="text-gray-400 hover:text-red-500 cursor-pointer text-xl transition-colors" />
              <FaInstagram className="text-gray-400 hover:text-red-500 cursor-pointer text-xl transition-colors" />
              <FaYoutube className="text-gray-400 hover:text-red-500 cursor-pointer text-xl transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-red-500 text-sm transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-red-500 text-sm transition-colors">Products</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-red-500 text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-red-500 text-sm transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Smartphone & Tab', 'Laptops', 'Audio & Headphones', 'Smart Watches', 'TV & Displays', 'Gaming & Consoles'].map(cat => (
                <li key={cat}>
                  <Link to="/products" className="text-gray-400 hover:text-red-500 text-sm transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <FiMapPin className="text-red-500 flex-shrink-0" />
                <span>No 12, Navalar Road, Jaffna</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <FiPhone className="text-red-500 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <FiMail className="text-red-500 flex-shrink-0" />
                <span>support@electromart.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2026 ElectroMart. All rights reserved. Made with ❤️ in Sri Lanka</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer