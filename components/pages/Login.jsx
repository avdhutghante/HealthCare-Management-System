import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock } from 'lucide-react'
import { useTheme } from '../utils/ThemeContext'
import Button from '../Button'
import Card from '../Card'
import ThemeToggle from '../ThemeToggle'
import { authAPI } from '../utils/api'

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const { setThemePreference } = useTheme()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      setErrors({})
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Login failed');
        }
        
        const { token, user } = data;
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log('🔐 User logged in:', user.name, 'Role:', user.role)
        
        // Update app state
        onLogin?.(user);

        // Redirect to unified dashboard (App.jsx handles role-based rendering)
        navigate('/dashboard');

      } catch (error) {
        console.error('Login error:', error)
        
        // Check if it's a pending approval error (403 status)
        if (error.response?.status === 403) {
          const message = error.response?.data?.message || 'Account pending approval'
          
          // Show popup for pending approval
          alert('🔒 Account Pending Approval\n\n' + message + '\n\nThe admin will review and approve your account soon. Please check back later.')
          
          // Also show in error field
          setErrors({ 
            email: 'Your account is pending admin approval. The admin will approve it soon.' 
          })
        } else if (error.response?.data?.message) {
          setErrors({ email: error.response.data.message })
        } else if (error.response?.status === 401) {
          setErrors({ email: 'Invalid email or password' })
        } else {
          setErrors({ email: 'Login failed. Please check your credentials.' })
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
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700">
          <div className="text-center mb-8">
            <LogIn className="w-16 h-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-300">Sign in to access your health dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 inline mr-2" />
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
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <Lock className="w-4 h-4 inline mr-2" />
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary dark:text-blue-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login