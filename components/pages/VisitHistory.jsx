import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, MapPin, FileText, TestTube, ChevronLeft, Filter, Stethoscope, DollarSign, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../Card'
import Button from '../Button'

const VisitHistory = ({ user }) => {
  const [visits, setVisits] = useState([])
  const [filteredVisits, setFilteredVisits] = useState([])
  const [filter, setFilter] = useState('all') // all, appointments, lab-tests
  const [lastVisitDate, setLastVisitDate] = useState(null)

  useEffect(() => {
    // Get all appointments
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const userAppointments = appointments.filter(apt => apt.patientName === user?.name)

    // Get all lab bookings
    const labBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
    const userLabBookings = labBookings.filter(booking => booking.patientName === user?.name)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Convert appointments to visits format (only past)
    const appointmentVisits = userAppointments
      .filter(apt => new Date(apt.date) < today)
      .map(apt => ({
        id: `apt-${apt.id}`,
        type: 'appointment',
        date: apt.date,
        time: apt.time,
        doctor: apt.doctor,
        reason: apt.reason,
        patientName: apt.patientName,
        status: 'completed',
        bookedAt: apt.bookedAt
      }))

    // Convert lab bookings to visits format (only past)
    const labVisits = userLabBookings
      .filter(booking => new Date(booking.date) < today)
      .map(booking => ({
        id: `lab-${booking.id}`,
        type: 'lab-test',
        date: booking.date,
        time: booking.time,
        tests: booking.tests,
        totalPrice: booking.totalPrice,
        patientName: booking.patientName,
        status: 'completed',
        bookedAt: booking.bookedAt
      }))

    // Combine and sort by date (most recent first)
    const allVisits = [...appointmentVisits, ...labVisits].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )

    setVisits(allVisits)
    setFilteredVisits(allVisits)

    // Calculate last visit date
    if (allVisits.length > 0) {
      const mostRecentVisit = allVisits[0]
      const visitDate = new Date(mostRecentVisit.date)
      const diffTime = Math.abs(today - visitDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setLastVisitDate(diffDays)
    }
  }, [user?.name])

  useEffect(() => {
    let filtered = []
    if (filter === 'appointments') {
      filtered = visits.filter(visit => visit.type === 'appointment')
    } else if (filter === 'lab-tests') {
      filtered = visits.filter(visit => visit.type === 'lab-test')
    } else {
      filtered = visits
    }
    setFilteredVisits(filtered)
  }, [filter, visits])

  const handleClearAllVisits = () => {
    if (window.confirm('Are you sure you want to clear your entire visit history? This will delete all past appointments and lab tests. This action cannot be undone.')) {
      // Clear user's appointments
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      const otherUsersAppointments = allAppointments.filter(apt => apt.patientName !== user?.name || new Date(apt.date) >= new Date())
      localStorage.setItem('appointments', JSON.stringify(otherUsersAppointments))
      
      // Clear user's lab bookings
      const allBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
      const otherUsersBookings = allBookings.filter(booking => booking.patientName !== user?.name || new Date(booking.date) >= new Date())
      localStorage.setItem('labBookings', JSON.stringify(otherUsersBookings))
      
      setVisits([])
      setLastVisitDate(null)
    }
  }

  const getRelativeTime = (dateString) => {
    const visitDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(today - visitDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
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
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Visit History</h1>
              <p className="text-lg text-gray-600">Track all your healthcare visits and interactions</p>
            </div>
            {visits.length > 0 && (
              <button
                onClick={handleClearAllVisits}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Clear History</span>
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
            <p className="text-3xl font-bold text-gray-900 mb-1">{visits.length}</p>
            <p className="text-sm text-gray-600">Total Visits</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {visits.filter(visit => visit.type === 'appointment').length}
            </p>
            <p className="text-sm text-gray-600">Doctor Consultations</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">
              {visits.filter(visit => visit.type === 'lab-test').length}
            </p>
            <p className="text-sm text-gray-600">Lab Tests Completed</p>
          </Card>
        </motion.div>

        {/* Last Visit Info */}
        {lastVisitDate !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Visit</p>
                  <p className="text-2xl font-bold text-gray-900">{lastVisitDate} days ago</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
                All Visits
              </button>
              <button
                onClick={() => setFilter('appointments')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'appointments'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setFilter('lab-tests')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'lab-tests'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Lab Tests
              </button>
            </div>
          </div>
        </motion.div>

        {/* Visits Timeline */}
        {filteredVisits.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-6">
              {filteredVisits.map((visit, index) => (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                >
                  <Card className={`p-6 hover:shadow-xl transition-shadow ${
                    visit.type === 'appointment' 
                      ? 'border-l-4 border-blue-500' 
                      : 'border-l-4 border-green-500'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {visit.type === 'appointment' ? (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <TestTube className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-heading font-bold text-gray-900">
                            {visit.type === 'appointment' ? 'Doctor Consultation' : 'Lab Tests'}
                          </h3>
                          <p className="text-sm text-gray-500">{getRelativeTime(visit.date)}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full uppercase">
                        Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-3">
                        {visit.type === 'appointment' && visit.doctor && (
                          <>
                            <div className="flex items-start space-x-3 pb-3 border-b border-gray-200">
                              <img
                                src={visit.doctor.image}
                                alt={visit.doctor.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                              />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Doctor</p>
                                <p className="font-semibold text-gray-900">{visit.doctor.name}</p>
                                <p className="text-sm text-blue-600">{visit.doctor.specialty}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                <p className="text-sm text-gray-900">{visit.doctor.address || visit.doctor.city}</p>
                              </div>
                            </div>
                          </>
                        )}

                        {visit.type === 'lab-test' && visit.tests && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center">
                              <TestTube className="w-4 h-4 mr-1" />
                              Tests Completed:
                            </p>
                            <div className="space-y-2">
                              {visit.tests.map((test) => (
                                <div key={test.id} className="flex items-start space-x-2 bg-green-50 p-2 rounded">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{test.name}</p>
                                    <p className="text-xs text-gray-600">${test.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-xs">Patient:</span>
                          </div>
                          <span className="font-medium text-gray-900">{visit.patientName}</span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-xs">Date:</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {new Date(visit.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-xs">Time:</span>
                          </div>
                          <span className="font-medium text-gray-900">{visit.time}</span>
                        </div>

                        {visit.type === 'appointment' && visit.reason && (
                          <div className="pt-3 mt-3 border-t border-gray-100">
                            <div className="flex items-start mb-2">
                              <FileText className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500 font-semibold">Reason for Visit:</p>
                            </div>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                              {visit.reason}
                            </p>
                          </div>
                        )}

                        {visit.type === 'lab-test' && visit.totalPrice && (
                          <div className="pt-3 mt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-1 text-green-500" />
                                <span className="text-sm font-semibold text-gray-700">Total Paid:</span>
                              </div>
                              <span className="text-xl font-bold text-green-600">${visit.totalPrice}</span>
                            </div>
                          </div>
                        )}

                        {visit.bookedAt && (
                          <div className="pt-2 text-xs text-gray-400">
                            Booked on: {new Date(visit.bookedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Visit History Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You don't have any completed visits yet."
                  : filter === 'appointments'
                  ? "You don't have any completed appointments."
                  : "You don't have any completed lab tests."}
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/appointments">
                  <Button>Book Appointment</Button>
                </Link>
                <Link to="/lab-tests">
                  <Button className="bg-green-600 hover:bg-green-700">Book Lab Tests</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default VisitHistory
