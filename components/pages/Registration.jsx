
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Phone, Calendar } from 'lucide-react'
import Button from '../Button'
import Card from '../Card'
import ThemeToggle from '../ThemeToggle'
import { authAPI } from '../utils/api'

const Registration = ({ onRegister }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    role: 'patient'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      setErrors({})
      
      try {
        // Prepare registration data
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        }
        
        // Call real backend API
        const response = await authAPI.register(registrationData)
        const { token, user, message } = response.data
        
        // Check if user needs approval (doctor/lab)
        if ((user.role === 'doctor' || user.role === 'lab') && !user.isApproved) {
          // Show success message and redirect to login
          alert(message || 'Registration successful! Please wait for admin approval before logging in.')
          navigate('/login')
          return
        }
        
        // For patients and admins - normal login flow
        localStorage.setItem('token', token)
        localStorage.setItem('currentUser', JSON.stringify(user))
        
        console.log('✅ User registered:', user.name, 'Role:', user.role)
        
        // Call onRegister to update App state
        onRegister(user)
        
        // Redirect to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('Registration error:', error)
        
        if (error.response?.data?.message) {
          setErrors({ email: error.response.data.message })
        } else if (error.response?.status === 400) {
          setErrors({ email: 'User already exists or invalid data' })
        } else {
          setErrors({ email: 'Registration failed. Please try again.' })
        }
      } finally {
        setLoading(false)
      }
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <UserPlus className="w-16 h-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-300">Join HealthCare AI for better health management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                {errors.dateOfBirth && <p className="text-danger text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2 dark:text-blue-400" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

export default Registration