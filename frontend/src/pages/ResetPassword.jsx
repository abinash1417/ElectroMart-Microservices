import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import toast from 'react-hot-toast'
import { FiZap, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [tokenValid, setTokenValid] = useState(null) // null = checking
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])

  const passwordRules = [
    { test: (p) => p.length >= 8,           label: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p),         label: 'One uppercase letter' },
    { test: (p) => /[a-z]/.test(p),         label: 'One lowercase letter' },
    { test: (p) => /[0-9]/.test(p),         label: 'One number' },
    { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
  ]

  const strengthScore = passwordRules.filter(r => r.test(password)).length
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strengthScore]
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strengthScore]

  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    const validate = async () => {
      try {
        const res = await API.get(`/api/password/validate-token?token=${token}`)
        setTokenValid(res.data.valid)
      } catch {
        setTokenValid(false)
      }
    }
    validate()
  }, [token])

  const handlePasswordChange = (val) => {
    setPassword(val)
    setPasswordErrors(passwordRules.filter(r => !r.test(val)).map(r => r.label))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (passwordRules.some(r => !r.test(password))) {
      toast.error('Password does not meet requirements!')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    setLoading(true)
    try {
      await API.post('/api/password/reset', { token, newPassword: password })
      setSuccess(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiZap className="text-red-500 text-3xl" />
            <span className="text-3xl font-bold text-white">Electro<span className="text-red-500">Mart</span></span>
          </div>
          <p className="text-gray-400">Reset your password</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">

          {/* Checking token */}
          {tokenValid === null && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Validating reset link...</p>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-600/20 border border-red-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-3xl">✗</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Link Expired or Invalid</h2>
              <p className="text-gray-400 text-sm mb-6">This reset link is invalid or has expired (15 min limit).<br />Please request a new one.</p>
              <Link to="/login" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                Back to Login
              </Link>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-600/20 border border-green-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-400 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-sm mb-6">Your password has been updated successfully.<br />You can now log in with your new password.</p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Go to Login
              </button>
            </div>
          )}

          {/* Reset Form */}
          {tokenValid === true && !success && (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
              <p className="text-gray-400 text-sm mb-6">Choose a strong password for your account</p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* New Password */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Strength Bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strengthScore ? strengthColor : 'bg-gray-700'}`}></div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">Strength: <span className={`font-semibold ${['','text-red-500','text-orange-500','text-yellow-500','text-blue-400','text-green-400'][strengthScore]}`}>{strengthLabel}</span></p>
                    </div>
                  )}

                  {/* Rules */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      {passwordRules.map((rule, i) => (
                        <p key={i} className={`text-xs flex items-center gap-1 ${rule.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                          <span>{rule.test(password) ? '✓' : '✗'}</span> {rule.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required
                      className={`w-full bg-gray-800 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${confirmPassword && password !== confirmPassword ? 'border-red-500' : confirmPassword && password === confirmPassword ? 'border-green-500' : 'border-gray-700 focus:border-red-500'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">✗ Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Resetting...</>
                    : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword