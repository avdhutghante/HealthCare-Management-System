import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, MapPin, FileText, ChevronLeft, Filter, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../Card'
import Button from '../Button'
import { appointmentAPI } from '../utils/api'
import realTimeSync from '../utils/realTimeSync'

const normalizePatientName = (value = '') => value.replace(/\s+/g, ' ').trim().toLowerCase()

const getStoredUserName = () => {
  try {
    const stored = localStorage.getItem('user')
    if (!stored) return ''
    const parsed = JSON.parse(stored)
    if (parsed && typeof parsed === 'object' && parsed.name) {
      return parsed.name
    }
  } catch (parseError) {
    console.warn('Unable to parse stored user payload:', parseError)
  }
  return ''
}

const formatSlotLabel = (slot) => {
  if (!slot) return ''
  if (slot.label) return slot.label

  const to12Hour = (value) => {
    if (!value) return ''
    const [hoursRaw, minsRaw] = value.split(':')
    const hours = Number.parseInt(hoursRaw, 10)
    const minutes = Number.parseInt(minsRaw, 10)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value

    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const start = to12Hour(slot.startTime)
  const end = slot.endTime ? to12Hour(slot.endTime) : ''
  return end ? `${start} - ${end}` : start
}

const MyAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)

  const resolvePatientName = () => {
    const explicit = typeof user?.name === 'string' ? user.name.trim() : ''
    if (explicit) return explicit
    return getStoredUserName().trim()
  }

  useEffect(() => {
    const effectiveName = resolvePatientName()
    const normalizedName = normalizePatientName(effectiveName)

    const readLocalAppointments = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('appointments') || '[]')
        if (!Array.isArray(saved)) return []

        let needsMigration = false
        const migratedAppointments = saved.map(apt => {
          const aptName = normalizePatientName(apt?.patientName || '')
          const doctorName = normalizePatientName(apt?.doctor?.name || '')

          if (effectiveName && normalizedName && (!aptName || aptName === 'you' || (doctorName && aptName === doctorName))) {
            needsMigration = true
            return { ...apt, patientName: effectiveName }
          }
          return apt
        })

        if (needsMigration) {
          localStorage.setItem('appointments', JSON.stringify(migratedAppointments))
          console.log(`Migrated appointments for patient ${effectiveName}`)
        }

        const activeAppointments = migratedAppointments.filter(
          (apt) => (apt.status || '').toLowerCase() !== 'cancelled'
        )

        if (!normalizedName) return activeAppointments
        return activeAppointments.filter((apt) => {
          const aptName = normalizePatientName(apt?.patientName || '')
          return aptName === normalizedName || aptName === 'you'
        })
      } catch (storageError) {
        console.error('Failed to parse stored appointments:', storageError)
        return []
      }
    }

    // First load from localStorage as fallback while fetching from backend
    const localAppointments = readLocalAppointments()
    
    const fetchRemoteAppointments = async () => {
      try {
        const response = await appointmentAPI.getMyAppointments({ limit: 100 })
        const remoteData = Array.isArray(response.data?.data) ? response.data.data : []

        const remoteAppointments = remoteData
          .filter((appointment) => (appointment.status || '').toLowerCase() !== 'cancelled')
          .map((appointment) => {
            const doctorUser = appointment.doctorId || {}
            const doctorProfile = appointment.doctor || {}

            const doctorName = doctorUser.name || doctorProfile.name || 'Doctor'
            const doctorSpecialty = doctorProfile.specialty || doctorUser.specialty || 'General Consultation'
            const doctorImage = doctorUser.profileImage || doctorProfile.image || ''
            const doctorCity = doctorProfile.hospitalAffiliation?.city || doctorUser.address?.city || ''
            const doctorAddress = doctorProfile.hospitalAffiliation?.address || doctorProfile.address || ''

            const timeLabel = formatSlotLabel(appointment.timeSlot)
            const reasonText = appointment.reasonForVisit || appointment.reason || appointment.notes || ''
            const patientDisplayName = effectiveName || appointment.patientId?.name || 'You'

            return {
              id: appointment._id,
              doctor: {
                name: doctorName,
                specialty: doctorSpecialty,
                image: doctorImage,
                city: doctorCity,
                address: doctorAddress
              },
              patientName: patientDisplayName,
              date: appointment.appointmentDate,
              time: timeLabel,
              reason: reasonText,
              status: appointment.status || 'scheduled',
              isMock: false,
              isFromBackend: true
            }
          })
        const filteredRemote = normalizedName
          ? remoteAppointments.filter((apt) => normalizePatientName(apt.patientName) === normalizedName)
          : remoteAppointments

        const mergedMap = new Map()
        sortedLocal.forEach((apt) => {
          const key = apt.id || `${normalizePatientName(apt.patientName || '')}-${apt.date}-${apt.time}`
          mergedMap.set(key, apt)
        })
        filteredRemote.forEach((apt) => {
          const key = apt.id || `${normalizePatientName(apt.patientName || '')}-${apt.date}-${apt.time}`
          mergedMap.set(key, apt)
        })

        const combined = Array.from(mergedMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        setAppointments(combined)
        setFilteredAppointments((prev) => {
          if (prev.length === 0 || prev.length === sortedLocal.length) {
            return combined
          }
          return prev
        })

        try {
          const existing = JSON.parse(localStorage.getItem('appointments') || '[]')
          const storageMap = new Map()
          if (Array.isArray(existing)) {
            existing.forEach((apt) => {
              const key = apt.id || `${normalizePatientName(apt.patientName || '')}-${apt.date}-${apt.time}`
              storageMap.set(key, apt)
            })
          }
          combined.forEach((apt) => {
            const key = apt.id || `${normalizePatientName(apt.patientName || '')}-${apt.date}-${apt.time}`
            storageMap.set(key, apt)
          })
          localStorage.setItem('appointments', JSON.stringify(Array.from(storageMap.values())))
        } catch (persistError) {
          console.warn('Unable to persist combined appointments:', persistError)
        }
      } catch (remoteError) {
        console.error('Error fetching appointments:', remoteError)
      }
    }

    fetchRemoteAppointments()
  }, [user?.name])

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filtered = []
    if (filter === 'upcoming') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= today
      })
    } else if (filter === 'past') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate < today
      })
    } else {
      filtered = appointments
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    setFilteredAppointments(filtered)
  }, [filter, appointments])

  const handleDeleteAppointment = async (appointment) => {
    if (!appointment) return

    const appointmentId = appointment.id || appointment._id
    const idAsString = String(appointmentId || '')
    const isMockAppointment =
      appointment.isMock === true ||
      !appointmentId ||
      typeof appointmentId !== 'string' ||
      idAsString.startsWith('mock-') ||
      idAsString.length < 20

    if (!isMockAppointment && appointmentId) {
      try {
        await appointmentAPI.cancel(appointmentId, { reason: 'Cancelled by patient' })
      } catch (apiError) {
        console.error('Failed to cancel appointment via API:', apiError)
        alert('Unable to cancel the appointment right now. Please try again in a moment.')
        return
      }
    }

    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const updatedAppointments = allAppointments.filter((apt) => {
      const currentId = apt.id || apt._id
      const currentIdStr = String(currentId || '')
      return currentIdStr !== idAsString
    })
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments))

    const effectiveName = normalizePatientName(resolvePatientName())
    const userAppointments = updatedAppointments.filter((apt) => {
      const aptName = normalizePatientName(apt?.patientName || '')
      return aptName === effectiveName || aptName === 'you'
    })

    setAppointments(userAppointments)
    setFilteredAppointments((prev) => prev.filter((apt) => String(apt.id || apt._id) !== String(appointmentId)))
    setShowDeleteConfirm(false)
    setAppointmentToDelete(null)

    window.dispatchEvent(new CustomEvent('appointments:updated'))
    alert('Appointment cancelled successfully.')
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your appointments? This action cannot be undone.')) {
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      const effectiveName = normalizePatientName(resolvePatientName())
      const otherUsersAppointments = allAppointments.filter((apt) => {
        const aptName = normalizePatientName(apt?.patientName || '')
        return aptName !== effectiveName && aptName !== 'you'
      })
      localStorage.setItem('appointments', JSON.stringify(otherUsersAppointments))
      setAppointments([])
      setFilteredAppointments([])
      window.dispatchEvent(new CustomEvent('appointments:updated'))
    }
  }

  const confirmDelete = (appointment) => {
    setAppointmentToDelete(appointment)
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
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-lg text-gray-600">View and manage all your appointments</p>
            </div>
            {appointments.length > 0 && (
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
            <p className="text-3xl font-bold text-gray-900 mb-1">{appointments.length}</p>
            <p className="text-sm text-gray-600">Total Appointments</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {appointments.filter(apt => new Date(apt.date) >= new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-gray-600 mb-1">
              {appointments.filter(apt => new Date(apt.date) < new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Past Appointments</p>
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

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((apt, index) => {
                const isPast = new Date(apt.date) < new Date()
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  >
                    <Card className={`p-6 hover:shadow-xl transition-shadow relative ${isPast ? 'opacity-75 border-l-4 border-gray-400' : 'border-l-4 border-primary'}`}>
                      <button
                        onClick={() => confirmDelete(apt)}
                        className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center justify-between mb-4 pr-10">
                        <h3 className="text-lg font-heading font-bold text-gray-900">
                          {isPast ? 'Past Appointment' : 'Upcoming Appointment'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                          isPast 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-success text-white'
                        }`}>
                          {isPast ? 'Completed' : apt.status}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-start space-x-4 mb-4 pb-4 border-b border-gray-200">
                        <img
                          src={apt.doctor.image}
                          alt={apt.doctor.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Doctor</p>
                          <h4 className="font-heading font-semibold text-gray-900 mb-1">{apt.doctor.name}</h4>
                          <p className="text-sm text-primary font-medium">{apt.doctor.specialty}</p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-xs">Patient:</span>
                          </div>
                          <span className="font-medium text-gray-900">{apt.patientName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-xs">Date:</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {new Date(apt.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-xs">Time:</span>
                          </div>
                          <span className="font-medium text-gray-900">{apt.time}</span>
                        </div>

                        <div className="flex items-start text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-xs block mb-1">Location:</span>
                            <span className="text-xs font-medium text-gray-900">{apt.doctor.address || apt.doctor.city}</span>
                          </div>
                        </div>

                        {/* Reason for Visit */}
                        {apt.reason && (
                          <div className="pt-3 mt-3 border-t border-gray-100">
                            <div className="flex items-start mb-2">
                              <FileText className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500 font-semibold">Reason for Visit:</p>
                            </div>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg leading-relaxed">
                              {apt.reason}
                            </p>
                          </div>
                        )}

                        {/* Booked At */}
                        {apt.bookedAt && (
                          <div className="pt-2 text-xs text-gray-400">
                            Booked on: {new Date(apt.bookedAt).toLocaleDateString('en-US', { 
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
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any appointments yet."
                  : filter === 'upcoming'
                  ? "You don't have any upcoming appointments."
                  : "You don't have any past appointments."}
              </p>
              <Link to="/appointments">
                <Button>Book New Appointment</Button>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* Action Button */}
        {filteredAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Link to="/appointments">
              <Button className="inline-flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Another Appointment
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && appointmentToDelete && (
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
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your appointment with <strong>{appointmentToDelete.doctor.name}</strong> on{' '}
                <strong>{new Date(appointmentToDelete.date).toLocaleDateString()}</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAppointment(appointmentToDelete)}
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

export default MyAppointments
