import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, Check, X, UserCheck, UserX, Mail, Phone, Calendar, Shield, AlertCircle } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import { adminAPI } from '../utils/api'

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all users and filter doctors
      const response = await adminAPI.getUsers()
      const allDoctors = response.data.data.filter(user => user.role === 'doctor')
      setDoctors(allDoctors)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to APPROVE Dr. ${doctorName}?`)) {
      return
    }

    try {
      await adminAPI.approveUser(doctorId)
      setSuccessMessage(`Dr. ${doctorName} has been approved successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchDoctors() // Refresh the list
    } catch (err) {
      console.error('Error approving doctor:', err)
      alert('Failed to approve doctor: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDisapprove = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to DISAPPROVE Dr. ${doctorName}? They will not be able to login.`)) {
      return
    }

    try {
      await adminAPI.rejectUser(doctorId)
      setSuccessMessage(`Dr. ${doctorName} has been disapproved.`)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchDoctors() // Refresh the list
    } catch (err) {
      console.error('Error disapproving doctor:', err)
      alert('Failed to disapprove doctor: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleToggleLogin = async (doctorId, doctorName, shouldAllow) => {
    const actionLabel = shouldAllow ? 'ALLOW' : 'REVOKE'
    if (!confirm(`Are you sure you want to ${actionLabel} login access for Dr. ${doctorName}?`)) {
      return
    }

    try {
      if (shouldAllow) {
        await adminAPI.activateUser(doctorId)
        setSuccessMessage(`Login access restored for Dr. ${doctorName}.`)
      } else {
        await adminAPI.deactivateUser(doctorId)
        setSuccessMessage(`Login access revoked for Dr. ${doctorName}.`)
      }

      setTimeout(() => setSuccessMessage(''), 3000)
      fetchDoctors()
    } catch (err) {
      console.error('Error toggling doctor login access:', err)
      alert(`Failed to ${shouldAllow ? 'allow' : 'revoke'} login: ` + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading doctors...</div>
      </div>
    )
  }

  // Separate doctors by approval status
  const pendingDoctors = doctors.filter(d => !d.isApproved)
  const approvedDoctors = doctors.filter(d => d.isApproved)

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="w-10 h-10 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Doctors
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            View all registered doctors and manage their access to the system
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg text-green-700 dark:text-green-200 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Doctors</p>
                <p className="text-4xl font-bold mt-2">{doctors.length}</p>
              </div>
              <Stethoscope className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved Doctors</p>
                <p className="text-4xl font-bold mt-2">{approvedDoctors.length}</p>
              </div>
              <UserCheck className="w-12 h-12 text-green-200 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Approval</p>
                <p className="text-4xl font-bold mt-2">{pendingDoctors.length}</p>
              </div>
              <UserX className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Pending Doctors Section */}
        {pendingDoctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Pending Approval ({pendingDoctors.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  onApprove={handleApprove}
                  onDisapprove={handleDisapprove}
                  onToggleLogin={handleToggleLogin}
                  isPending={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Approved Doctors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-green-500" />
            Approved Doctors ({approvedDoctors.length})
          </h2>

          {approvedDoctors.length === 0 ? (
            <Card className="p-12 text-center">
              <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No approved doctors yet
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  onApprove={handleApprove}
                  onDisapprove={handleDisapprove}
                  onToggleLogin={handleToggleLogin}
                  isPending={false}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Doctor Card Component
const DoctorCard = ({ doctor, onApprove, onDisapprove, onToggleLogin, isPending }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 ${
        isPending 
          ? 'border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20' 
          : 'border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
      }`}>
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Dr. {doctor.name}
            </h3>
            {doctor.specialization && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {doctor.specialization}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isPending
              ? 'bg-orange-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {isPending ? '⏳ PENDING' : '✓ APPROVED'}
          </span>
        </div>

        {/* Doctor Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm truncate">{doctor.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{doctor.phone || 'No phone'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Registered: {new Date(doctor.createdAt).toLocaleDateString()}
            </span>
          </div>

          {doctor.experience && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{doctor.experience} years experience</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
          {isPending ? (
            <>
              <button
                onClick={() => onApprove(doctor._id, doctor.name)}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onDisapprove(doctor._id, doctor.name)}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : doctor.isActive ? (
            <>
              <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                Can Login
              </div>
              <button
                onClick={() => onToggleLogin?.(doctor._id, doctor.name, false)}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <X className="w-4 h-4" />
                Revoke
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
                <X className="w-4 h-4" />
                Login Disabled
              </div>
              <button
                onClick={() => onToggleLogin?.(doctor._id, doctor.name, true)}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <Check className="w-4 h-4" />
                Allow Login
              </button>
            </>
          )}
        </div>

        {/* Login Status */}
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Login Status:</span>
            <span className={`font-bold ${
              isPending 
                ? 'text-red-600 dark:text-red-400' 
                : doctor.isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {isPending ? '🔒 BLOCKED' : doctor.isActive ? '🔓 ALLOWED' : '🔒 BLOCKED'}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ManageDoctors
