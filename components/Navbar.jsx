import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Activity, LogOut, User, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from './utils/ThemeContext'

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'admin'
      ? [
          // Admin-specific menu items - only Dashboard
        ]
      : user?.role === 'doctor' 
      ? [
          // Doctor-specific menu items - only Dashboard
        ]
      : user?.role === 'lab'
      ? [
          { path: '/lab-bookings', label: 'Test Bookings' }
        ]
      : [
          { path: '/book-appointment', label: 'Book Appointment' },
          { path: '/my-appointments', label: 'My Appointments' },
          { path: '/lab-tests', label: 'Book Lab Tests' },
          { path: '/my-lab-tests', label: 'My Lab Tests' },
          { path: '/visit-history', label: 'Visit History' },
          { path: '/bmi-calculator', label: 'BMI Calculator' },
          { path: '/heart-disease', label: 'Heart Disease Check' },
          { path: '/ai-symptom-checker', label: 'AI Symptom Checker' },
          { path: '/chatbot', label: 'AI Assistant' }
        ]
    )
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <Activity className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-bold text-primary dark:text-blue-400">HealthCare AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 bg-secondary dark:bg-gray-700 rounded-lg">
              <User className="w-5 h-5 text-primary dark:text-blue-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
                <span className={`text-xs font-semibold ${
                  user?.role === 'admin' ? 'text-red-600 dark:text-red-400' :
                  user?.role === 'doctor' ? 'text-green-600 dark:text-green-400' :
                  user?.role === 'lab' ? 'text-purple-600 dark:text-purple-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {isOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
              </button>
              <div className="flex items-center space-x-2 px-4 py-2 bg-secondary dark:bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-primary dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar