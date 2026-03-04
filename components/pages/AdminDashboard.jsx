import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Activity, Stethoscope, Beaker, Calendar, Check, X, ArrowRight } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import { adminAPI } from '../utils/api'

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatAddress = (address) => {
    if (!address) return ''
    if (typeof address === 'string') return address
    if (Array.isArray(address)) {
      return address
        .map(item => formatAddress(item))
        .filter(Boolean)
        .join(', ')
    }
    if (typeof address === 'object') {
      const preferredKeys = ['street', 'line1', 'line2', 'city', 'state', 'zipCode', 'postalCode', 'country']
      const parts = preferredKeys
        .map(key => (typeof address[key] === 'string' ? address[key].trim() : ''))
        .filter(Boolean)
      if (parts.length > 0) {
        return parts.join(', ')
      }
      const fallbackParts = Object.values(address)
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
      return fallbackParts.join(', ')
    }
    return String(address)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await adminAPI.getStats()
        setStats(statsResponse.data.data)
        
        // Fetch pending approvals
        const approvalsResponse = await adminAPI.getPendingApprovals()
        setPendingApprovals(approvalsResponse.data.data)
        
        // Fetch all users
        const usersResponse = await adminAPI.getUsers()
        setAllUsers(usersResponse.data.data)
        
        // Filter approved doctors and labs from all users
        setDoctors(usersResponse.data.data.filter(u => u.role === 'doctor' && u.isApproved))
        setLabs(usersResponse.data.data.filter(u => u.role === 'lab' && u.isApproved))
        
        setError('')
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId)
      alert('User approved successfully!')
      fetchDashboardData() // Refresh data
    } catch (err) {
      console.error('Error approving user:', err)
      alert('Failed to approve user: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleReject = async (userId) => {
    try {
      await adminAPI.rejectUser(userId)
      alert('User rejected successfully!')
      fetchDashboardData() // Refresh data
    } catch (err) {
      console.error('Error rejecting user:', err)
      alert('Failed to reject user: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {user?.name}! Manage your healthcare system.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-900 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm">Total Users</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-gray-700" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 text-gray-900 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm">Doctors</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalDoctors || 0}</p>
                  </div>
                  <Stethoscope className="w-12 h-12 text-gray-700" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 text-gray-900 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm">Laboratories</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalLabs || 0}</p>
                  </div>
                  <Beaker className="w-12 h-12 text-gray-700" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 text-gray-900 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm">Pending Approvals</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stats.pendingApprovals || 0}</p>
                  </div>
                  <Activity className="w-12 h-12 text-gray-700" />
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Three Column Layout: Logged Users, Pending Doctors, Pending Labs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logged In Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 h-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Logged Users
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(allUsers || []).filter(u => u.role !== 'admin').map((loggedUser) => (
                  <div
                    key={loggedUser._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {loggedUser.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loggedUser.role === 'doctor' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : loggedUser.role === 'lab'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {loggedUser.role?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p className="truncate">{loggedUser.email}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(loggedUser.createdAt).toLocaleDateString()} at {new Date(loggedUser.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Doctors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 h-full cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-500"
                  onClick={() => navigate('/admin/manage-doctors')}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-green-500" />
                  Doctors
                </h2>
                <ArrowRight className="w-5 h-5 text-green-500" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click to manage all doctors, approve pending registrations, and control access
              </p>

              {(doctors || []).length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No approved doctors yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(doctors || []).map((doctor) => (
                    <div
                      key={doctor._id}
                      className="border border-green-200 dark:border-green-700 rounded-lg p-3 bg-green-50 dark:bg-green-900/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {doctor.name}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          APPROVED
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p className="truncate">{doctor.email}</p>
                        <p>{doctor.phone}</p>
                        {doctor.specialization && (
                          <p className="font-medium text-green-600 dark:text-green-400">
                            {doctor.specialization}
                          </p>
                        )}
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(doctor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Labs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 h-full cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-500"
                  onClick={() => navigate('/admin/manage-labs')}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Beaker className="w-6 h-6 text-purple-500" />
                  Labs
                </h2>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click to manage all labs, approve pending registrations, and control access
              </p>

              {(labs || []).length === 0 ? (
                <div className="text-center py-8">
                  <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No approved labs yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(labs || []).map((lab) => {
                    const addressText = formatAddress(lab.address)
                    return (
                      <div
                        key={lab._id}
                        className="border border-purple-200 dark:border-purple-700 rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {lab.name}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            APPROVED
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p className="truncate">{lab.email}</p>
                          <p>{lab.phone}</p>
                          {addressText && (
                            <p className="font-medium text-purple-600 dark:text-purple-400">
                              {addressText}
                            </p>
                          )}
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(lab.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
