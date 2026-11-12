import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import toast from 'react-hot-toast'
import { FiZap, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone, FiMapPin } from 'react-icons/fi'

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', address: '', city: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const navigate = useNavigate()

  const passwordRules = [
    { test: (p) => p.length >= 8,            label: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p),          label: 'One uppercase letter' },
    { test: (p) => /[a-z]/.test(p),          label: 'One lowercase letter' },
    { test: (p) => /[0-9]/.test(p),          label: 'One number' },
    { test: (p) => /[^A-Za-z0-9]/.test(p),  label: 'One special character (!@#$...)' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      setPasswordErrors(passwordRules.filter(r => !r.test(value)).map(r => r.label))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const failed = passwordRules.filter(r => !r.test(form.password))
    if (failed.length > 0) {
      toast.error('Password does not meet requirements!')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length < 9) {
      toast.error('Please enter a valid phone number!')
      return
    }
    if (!form.address.trim()) {
      toast.error('Please enter your address!')
      return
    }

    setLoading(true)
    try {
      await API.post('/users/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        address: form.address,
        city: form.city
      })
      toast.success('Account created successfully! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed!')
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = passwordRules.filter(r => r.test(form.password)).length
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strengthScore]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strengthScore]

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiZap className="text-red-500 text-3xl" />
            <span className="text-3xl font-bold text-white">Electro<span className="text-red-500">Mart</span></span>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Get Started!</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
              <div className="relative flex gap-2">
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-gray-400 text-sm flex items-center flex-shrink-0">+94</div>
                <div className="relative flex-1">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                    placeholder="071 234 5678" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Delivery Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3.5 text-gray-500" />
                <textarea name="address" value={form.address} onChange={handleChange}
                  placeholder="No. 123, Main Street, Colombo" required rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none" />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange}
                placeholder="Colombo" required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strengthScore ? strengthColor : 'bg-gray-700'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Strength: <span className={`font-semibold ${['','text-red-500','text-orange-500','text-yellow-500','text-blue-400','text-green-400'][strengthScore]}`}>{strengthLabel}</span></p>
                </div>
              )}

              {/* Password Rules */}
              {form.password && passwordErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((rule, i) => (
                    <p key={i} className={`text-xs flex items-center gap-1 ${rule.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                      <span>{rule.test(form.password) ? '✓' : '✗'}</span> {rule.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" required
                  className={`w-full bg-gray-800 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500' : form.confirmPassword && form.password === form.confirmPassword ? 'border-green-500' : 'border-gray-700 focus:border-red-500'}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">✗ Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Create Account'}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register