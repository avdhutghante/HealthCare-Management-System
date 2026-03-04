import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TestTube, Calendar, Clock, DollarSign, ChevronLeft, Filter, FileText, User, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../Card'
import Button from '../Button'

const MyLabTests = ({ user }) => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
    console.log('MyLabTests - All stored bookings:', storedBookings)
    console.log('MyLabTests - User name:', user?.name)
    
    const userBookings = storedBookings.filter(booking => booking.patientName === user?.name)
    console.log('MyLabTests - Filtered user bookings:', userBookings)
    
    setBookings(userBookings)
    setFilteredBookings(userBookings)
  }, [user?.name])

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered = []
    if (filter === 'upcoming') {
      filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate || booking.date)
        return bookingDate >= today
      })
    } else if (filter === 'past') {
      filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate || booking.date)
        return bookingDate < today
      })
    } else {
      filtered = bookings
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate || b.date) - new Date(a.bookingDate || a.date))
    setFilteredBookings(filtered)
  }, [filter, bookings])

  const handleDeleteBooking = (bookingId) => {
    const allBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
    const updatedBookings = allBookings.filter(booking => booking.id !== bookingId)
    localStorage.setItem('labBookings', JSON.stringify(updatedBookings))
    
    const userBookings = updatedBookings.filter(booking => booking.patientName === user?.name)
    setBookings(userBookings)
    setShowDeleteConfirm(false)
    setBookingToDelete(null)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your lab test bookings? This action cannot be undone.')) {
      const allBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
      const otherUsersBookings = allBookings.filter(booking => booking.patientName !== user?.name)
      localStorage.setItem('labBookings', JSON.stringify(otherUsersBookings))
      setBookings([])
    }
  }

  const confirmDelete = (booking) => {
    setBookingToDelete(booking)
    setShowDeleteConfirm(true)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:text-blue-700 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">My Lab Tests</h1>
              <p className="text-lg text-gray-600">View and manage all your lab test bookings</p>
            </div>
            {bookings.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Clear All</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
        >
          <Card className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{bookings.length}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">
              {bookings.filter(booking => new Date(booking.bookingDate || booking.date) >= new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Upcoming Tests</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-gray-600 mb-1">
              {bookings.filter(booking => new Date(booking.bookingDate || booking.date) < new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Completed Tests</p>
          </Card>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'upcoming'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'past'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Past
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lab Test Bookings List */}
        {filteredBookings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking, index) => {
                const isPast = new Date(booking.bookingDate || booking.date) < new Date()
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  >
                    <Card className={`p-6 hover:shadow-xl transition-shadow relative ${isPast ? 'opacity-75 border-l-4 border-gray-400' : 'border-l-4 border-green-500'}`}>
                      <button
                        onClick={() => confirmDelete(booking)}
                        className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete lab test booking"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center justify-between mb-4 pr-10">
                        <h3 className="text-lg font-heading font-bold text-gray-900">
                          {isPast ? 'Completed Tests' : 'Upcoming Tests'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                          isPast 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-success text-white'
                        }`}>
                          {isPast ? 'Completed' : booking.status}
                        </span>
                      </div>

                      {/* Tests List */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        {booking.lab && (
                          <div className="flex items-center mb-3 p-2 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-500 font-semibold mr-1">Lab:</span>
                            <p className="text-sm font-medium text-blue-600">{booking.lab.name}</p>
                          </div>
                        )}
                        <div className="flex items-center mb-3">
                          <TestTube className="w-5 h-5 mr-2 text-green-500" />
                          <p className="text-xs text-gray-500 font-semibold">Tests Booked:</p>
                        </div>
                        <div className="space-y-2">
                          {booking.tests.map((test) => (
                            <div key={test.id} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{test.name}</p>
                                {test.description && (
                                  <p className="text-xs text-gray-500">{test.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-primary font-semibold">${test.price}</span>
                                  {test.fasting && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      Fasting Required
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-xs">Patient:</span>
                          </div>
                          <span className="font-medium text-gray-900">{booking.patientName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-xs">Date:</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {new Date(booking.bookingDate || booking.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-xs">Time:</span>
                          </div>
                          <span className="font-medium text-gray-900">{booking.timeSlot || booking.time}</span>
                        </div>

                        {/* Total Price */}
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 mr-1 text-green-500" />
                              <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">${booking.totalPrice}</span>
                          </div>
                        </div>

                        {/* Booked At */}
                        {booking.bookedAt && (
                          <div className="pt-2 text-xs text-gray-400">
                            Booked on: {new Date(booking.bookedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-12 text-center">
              <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lab Tests Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any lab tests yet."
                  : filter === 'upcoming'
                  ? "You don't have any upcoming lab tests."
                  : "You don't have any past lab tests."}
              </p>
              <Link to="/lab-tests">
                <Button>Book Lab Tests</Button>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* Action Button */}
        {filteredBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Link to="/lab-tests">
              <Button className="inline-flex items-center">
                <TestTube className="w-5 h-5 mr-2" />
                Book More Tests
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && bookingToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this lab test booking scheduled for{' '}
                <strong>{new Date(bookingToDelete.date).toLocaleDateString()}</strong>?
              </p>
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tests included:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {bookingToDelete.tests.map((test) => (
                    <li key={test.id}>• {test.name}</li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBooking(bookingToDelete.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyLabTests
