import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Beaker, Check, X, UserCheck, UserX, Mail, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react'
import Card from '../Card'
import Button from '../Button'
import { adminAPI } from '../utils/api'

const ManageLabs = () => {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchLabs()
  }, [])

  const fetchLabs = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all users and filter labs
      const response = await adminAPI.getUsers()
      const allLabs = response.data.data.filter(user => user.role === 'lab')
      setLabs(allLabs)
    } catch (err) {
      console.error('Error fetching labs:', err)
      setError('Failed to load labs')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (labId, labName) => {
    if (!confirm(`Are you sure you want to APPROVE ${labName}?`)) {
      return
    }

    try {
      await adminAPI.approveUser(labId)
      setSuccessMessage(`${labName} has been approved successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchLabs() // Refresh the list
    } catch (err) {
      console.error('Error approving lab:', err)
      alert('Failed to approve lab: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDisapprove = async (labId, labName) => {
    if (!confirm(`Are you sure you want to DISAPPROVE ${labName}? They will not be able to login.`)) {
      return
    }

    try {
      await adminAPI.rejectUser(labId)
      setSuccessMessage(`${labName} has been disapproved.`)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchLabs() // Refresh the list
    } catch (err) {
      console.error('Error disapproving lab:', err)
      alert('Failed to disapprove lab: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading labs...</div>
      </div>
    )
  }

  // Separate labs by approval status
  const pendingLabs = labs.filter(l => !l.isApproved)
  const approvedLabs = labs.filter(l => l.isApproved)

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
            <Beaker className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Labs
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            View all registered laboratories and manage their access to the system
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
                <p className="text-blue-100 text-sm font-medium">Total Labs</p>
                <p className="text-4xl font-bold mt-2">{labs.length}</p>
              </div>
              <Beaker className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Approved Labs</p>
                <p className="text-4xl font-bold mt-2">{approvedLabs.length}</p>
              </div>
              <UserCheck className="w-12 h-12 text-purple-200 opacity-80" />
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
                <p className="text-4xl font-bold mt-2">{pendingLabs.length}</p>
              </div>
              <UserX className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Pending Labs Section */}
        {pendingLabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Pending Approval ({pendingLabs.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingLabs.map((lab) => (
                <LabCard
                  key={lab._id}
                  lab={lab}
                  onApprove={handleApprove}
                  onDisapprove={handleDisapprove}
                  isPending={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Approved Labs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-500" />
            Approved Labs ({approvedLabs.length})
          </h2>

          {approvedLabs.length === 0 ? (
            <Card className="p-12 text-center">
              <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No approved labs yet
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedLabs.map((lab) => (
                <LabCard
                  key={lab._id}
                  lab={lab}
                  onApprove={handleApprove}
                  onDisapprove={handleDisapprove}
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

// Lab Card Component
const LabCard = ({ lab, onApprove, onDisapprove, isPending }) => {
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
          : 'border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
      }`}>
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {lab.name}
            </h3>
            {lab.address && (
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {typeof lab.address === 'object' 
                  ? `${lab.address.street}, ${lab.address.city}, ${lab.address.state}` 
                  : lab.address}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isPending
              ? 'bg-orange-500 text-white'
              : 'bg-purple-500 text-white'
          }`}>
            {isPending ? '⏳ PENDING' : '✓ APPROVED'}
          </span>
        </div>

        {/* Lab Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm truncate">{lab.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{lab.phone || 'No phone'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Registered: {new Date(lab.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
          {isPending ? (
            <>
              <button
                onClick={() => onApprove(lab._id, lab.name)}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onDisapprove(lab._id, lab.name)}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                Can Login
              </div>
              <button
                onClick={() => onDisapprove(lab._id, lab.name)}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <X className="w-4 h-4" />
                Revoke
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
                : 'text-purple-600 dark:text-purple-400'
            }`}>
              {isPending ? '🔒 BLOCKED' : '🔓 ALLOWED'}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ManageLabs
