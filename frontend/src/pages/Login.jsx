import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import toast from 'react-hot-toast'
import { FiZap, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/users/login', { email, password })
      login(res.data, res.data.token)
      toast.success(`Welcome back, ${res.data.name}! 👋`)
      if (res.data.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message 
        || (err.response?.status === 503 ? 'Auth service is starting or unavailable' : null)
        || (err.code === 'ERR_NETWORK' ? 'Cannot connect to Gateway (port 8080)' : 'Invalid email or password!')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setSendingReset(true)
    try {
      await API.post('/api/password/forgot', { email: forgotEmail })
      setResetSent(true)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSendingReset(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiZap className="text-red-500 text-3xl" />
            <span className="text-3xl font-bold text-white">
              Electro<span className="text-red-500">Mart</span>
            </span>
          </div>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {!showForgot ? (
          /* ── Login Form ── */
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Welcome Back!</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Password</label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Sign In'}
              </button>
            </form>

            <p className="text-gray-400 text-sm text-center mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-400 font-medium">Create one</Link>
            </p>
          </div>

        ) : (
          /* ── Forgot Password Form ── */
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <button onClick={() => { setShowForgot(false); setResetSent(false); setForgotEmail('') }}
              className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mb-6 transition-colors">
              ← Back to Login
            </button>

            {!resetSent ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-red-600/20 border border-red-600/40 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiLock className="text-red-500 text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
                  <p className="text-gray-400 text-sm mt-2">Enter your email and we'll send you a reset link</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com" required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={sendingReset}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    {sendingReset
                      ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Sending...</>
                      : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-600/20 border border-green-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-400 text-3xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check Your Email!</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  If <span className="text-white">{forgotEmail}</span> is registered,<br />
                  a password reset link has been sent.<br />
                  <span className="text-gray-500 text-xs mt-1 block">The link expires in 15 minutes.</span>
                </p>
                <button onClick={() => { setShowForgot(false); setResetSent(false); setForgotEmail('') }}
                  className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
                  ← Back to Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login