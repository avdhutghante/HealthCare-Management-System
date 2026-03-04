import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, CheckCircle, MapPin, Star, Navigation, AlertCircle } from 'lucide-react'
import { timeSlots, locations, doctorsWithLocation } from '../data/mockData'
import Button from '../Button'
import Card from '../Card'
import { doctorAPI, appointmentAPI } from '../utils/api'

const Appointments = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [nearbyDoctors, setNearbyDoctors] = useState([])
  const [allDoctors, setAllDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [reason, setReason] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [appointments, setAppointments] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    const effectiveName = user?.name || getStoredUserName()
    const normalizedEffective = effectiveName.trim().toLowerCase()

    const readLocalAppointments = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('appointments') || '[]')
        if (!Array.isArray(saved)) return []
        if (!normalizedEffective) return saved
        return saved.filter((apt) => {
          const aptName = (apt?.patientName || '').trim().toLowerCase()
          return aptName === normalizedEffective || aptName === 'you'
        })
      } catch (storageError) {
        console.error('Failed to read appointments from storage:', storageError)
        return []
      }
    }

    const localAppointments = readLocalAppointments()
    const sortedLocal = [...localAppointments].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    setAppointments(sortedLocal)

    const fetchRemoteAppointments = async () => {
      try {
        const response = await appointmentAPI.getMyAppointments({ limit: 100 })
        const remoteData = Array.isArray(response.data?.data) ? response.data.data : []

        const remoteAppointments = remoteData.map((appointment) => {
          const doctorUser = appointment.doctorId || {}
          const doctorProfile = appointment.doctor || {}

          const doctorName = doctorUser.name || doctorProfile.name || 'Doctor'
          const doctorSpecialty = doctorProfile.specialty || doctorUser.specialty || 'General Consultation'
          const doctorImage = doctorUser.profileImage || doctorProfile.image || ''
          const doctorCity = doctorProfile.hospitalAffiliation?.city || doctorUser.address?.city || ''

          const timeLabel = formatSlotLabel(appointment.timeSlot)
          const reasonText = appointment.reasonForVisit || appointment.reason || ''
          const patientDisplayName = user?.name || appointment.patientId?.name || effectiveName || 'You'

          return {
            id: appointment._id,
            doctor: {
              name: doctorName,
              specialty: doctorSpecialty,
              image: doctorImage,
              city: doctorCity
            },
            patientName: patientDisplayName,
            date: appointment.appointmentDate,
            time: timeLabel,
            reason: reasonText,
            status: appointment.status || 'scheduled',
            isMock: false
          }
        })

        const mergedMap = new Map()
        sortedLocal.forEach((apt) => {
          const key = apt.id || `local-${apt.date}-${apt.time}`
          mergedMap.set(key, apt)
        })
        remoteAppointments.forEach((apt) => {
          const key = apt.id || `remote-${apt.date}-${apt.time}`
          mergedMap.set(key, apt)
        })

        const combined = Array.from(mergedMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        setAppointments(combined)

        try {
          const existing = JSON.parse(localStorage.getItem('appointments') || '[]')
          const otherEntries = Array.isArray(existing)
            ? existing.filter((entry) => {
                if (!normalizedEffective) return true
                const entryName = (entry?.patientName || '').trim().toLowerCase()
                return entryName !== normalizedEffective && entryName !== 'you'
              })
            : []
          localStorage.setItem('appointments', JSON.stringify([...otherEntries, ...combined]))
        } catch (persistError) {
          console.warn('Unable to persist combined appointments:', persistError)
        }
      } catch (remoteError) {
        console.error('Error fetching appointments:', remoteError)
      }
    }

    fetchRemoteAppointments()
  }, [user?.name])

  const getDoctorUserId = (doctor) => {
    if (!doctor?.userId) return null
    if (typeof doctor.userId === 'string') return doctor.userId
    if (typeof doctor.userId === 'object') {
      return doctor.userId._id || null
    }
    return null
  }

  const formatSlotLabel = (slot) => {
    if (!slot) return ''
    if (slot.label) return slot.label

    const to12Hour = (value) => {
      if (!value) return ''
      const [hourString, minuteString] = value.split(':')
      const hours = Number.parseInt(hourString, 10)
      const minutes = Number.parseInt(minuteString, 10)
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

    if (slot.startTime && slot.endTime) {
      return `${to12Hour(slot.startTime)} - ${to12Hour(slot.endTime)}`
    }

    return slot.startTime || ''
  }

  const filterDoctorsByLocation = (doctors, location) => {
    const target = location?.toLowerCase()
    if (!target) return []

    return doctors.filter((doc) => {
      const docCity = doc.city || doc.location || doc.hospitalAffiliation?.city || doc.userId?.address?.city || ''
      return docCity.toLowerCase() === target
    })
  }

  // Fetch real doctors from backend on component mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  // Load existing appointments from localStorage on component mount
  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const userAppointments = savedAppointments.filter(apt => apt.patientName === user?.name)
    setAppointments(userAppointments)
  }, [user?.name])

  useEffect(() => {
    const doctorUserId = getDoctorUserId(selectedDoctor)

    if (!selectedDoctor || !doctorUserId || !selectedDate) {
      setAvailableSlots([])
      setSlotsLoading(false)
      setSlotsError('')
      setSelectedSlot(null)
      return
    }

    let isActive = true

    const fetchSlots = async () => {
      setSlotsLoading(true)
      setSlotsError('')

      try {
        const response = await appointmentAPI.getAvailableSlots({
          doctorId: doctorUserId,
          date: selectedDate
        })

        if (!isActive) return

        const slots = response.data?.slots || []
        setAvailableSlots(slots)

        if (slots.length === 0) {
          setSelectedSlot(null)
          setSelectedTime('')
        }
      } catch (err) {
        if (!isActive) return
        console.error('Error fetching available slots:', err)
        setSlotsError(err.response?.data?.message || 'Unable to load available slots')
        setAvailableSlots([])
        setSelectedSlot(null)
      } finally {
        if (isActive) {
          setSlotsLoading(false)
        }
      }
    }

    fetchSlots()

    return () => {
      isActive = false
    }
  }, [selectedDoctor, selectedDate])

  useEffect(() => {
    if (!selectedLocation) {
      setNearbyDoctors([])
      return
    }

    const filtered = filterDoctorsByLocation(allDoctors, selectedLocation)
    setNearbyDoctors(filtered)
  }, [allDoctors, selectedLocation])

  const fetchDoctors = async () => {
    try {
  const response = await doctorAPI.getAll({ limit: 100 })
      const doctors = response.data.data || []
      // Only show approved doctors
      const approvedDoctors = doctors.filter(doc => doc.userId?.isApproved === true)

      const normalizedDoctors = approvedDoctors.map(doc => ({
        ...doc,
        city: doc.hospitalAffiliation?.city || doc.userId?.address?.city || doc.city || ''
      }))

      const mockDoctorsWithFlag = doctorsWithLocation.map((doc) => ({
        ...doc,
        isMock: true
      }))

      const combinedDoctors = normalizedDoctors.length > 0
        ? [...normalizedDoctors, ...mockDoctorsWithFlag]
        : mockDoctorsWithFlag

      setAllDoctors(combinedDoctors)
      console.log('Loaded doctors (backend + mock):', combinedDoctors)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      // Use mock data as fallback when API fails
      console.log('API error, using mock data as fallback')
      const mockDoctorsWithFlag = doctorsWithLocation.map((doc) => ({
        ...doc,
        isMock: true
      }))
      setAllDoctors(mockDoctorsWithFlag)
    }
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    console.log(`Filtering doctors for ${location}`)
    setSelectedDoctor(null)
    setSelectedDate('')
    setSelectedTime('')
    setSelectedSlot(null)
    setAvailableSlots([])
    setSlotsError('')
    setSlotsLoading(false)
    setError('')
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedDate('')
    setSelectedTime('')
    setSelectedSlot(null)
    setAvailableSlots([])
    setSlotsError('')
    setSlotsLoading(false)
    setError('')
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
    setAvailableSlots([])
    setSlotsError('')
    setSelectedTime('')
    setSelectedSlot(null)
    setSlotsLoading(false)
    setError('')
  }

  const handleSlotSelect = (slot, isBackendDoctor) => {
    setError('')
    if (isBackendDoctor) {
      setSelectedSlot(slot)
      setSelectedTime(formatSlotLabel(slot))
    } else {
      setSelectedSlot(null)
      setSelectedTime(slot)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const doctorName = selectedDoctor.name || selectedDoctor.userId?.name || 'Unknown'
      const doctorSpecialty = selectedDoctor.specialty || selectedDoctor.specialization || 'General Practitioner'
      const doctorImage = selectedDoctor.image || selectedDoctor.userId?.profileImage || ''
      const doctorCity = selectedDoctor.city || selectedDoctor.location || selectedDoctor.hospitalAffiliation?.city || selectedLocation
      const doctorUserId = getDoctorUserId(selectedDoctor)
      const isMockDoctor = !doctorUserId
      
      // Check if using mock data (no userId means it's mock data)
      if (isMockDoctor) {
        // Mock booking - save to local state AND localStorage
        const newAppointment = {
          id: Date.now(),
          doctor: {
            name: doctorName,
            specialty: doctorSpecialty,
            image: doctorImage,
            city: doctorCity
          },
          patientName: user.name,
          date: selectedDate,
          time: selectedTime,
          reason: reason,
          status: 'confirmed'
        }
        
        // Save to localStorage
        const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
        existingAppointments.push(newAppointment)
        localStorage.setItem('appointments', JSON.stringify(existingAppointments))
        
        // Save to component state
        setAppointments(prev => [...prev, newAppointment])
        console.log('Mock booking saved to localStorage and state:', newAppointment)
        
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        
        // Reset form
        setSelectedDoctor(null)
        setSelectedDate('')
        setSelectedTime('')
        setSelectedSlot(null)
        setAvailableSlots([])
        setSlotsError('')
        setSlotsLoading(false)
        setReason('')
        setSymptoms('')
        setLoading(false)
        return
      }

      if (!selectedSlot) {
        setError('Please select an available slot for this doctor')
        setLoading(false)
        return
      }

      // Prepare appointment data for backend
      const appointmentData = {
        doctorId: doctorUserId,
        appointmentDate: selectedDate,
        timeSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          label: selectedSlot.label || selectedTime
        },
        reasonForVisit: reason,
        symptoms: symptoms || '',
        notes: ''
      }

      console.log('Booking appointment with data:', appointmentData)

      // Save to backend API
      const response = await appointmentAPI.create(appointmentData)
      console.log('Appointment created:', response.data)

      // Add to local state for immediate display
      const newAppointment = {
        id: response.data.data._id,
        doctor: {
          name: doctorName,
          specialty: doctorSpecialty,
          image: doctorImage,
          city: doctorCity
        },
        patientName: user.name,
        date: selectedDate,
        time: selectedTime,
        reason: reason,
        status: 'confirmed'
      }
      
      // Save to localStorage
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      existingAppointments.push(newAppointment)
      localStorage.setItem('appointments', JSON.stringify(existingAppointments))
      
      // Save to component state
      setAppointments(prev => [...prev, newAppointment])

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Reset form
      setSelectedDoctor(null)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedSlot(null)
      setAvailableSlots([])
      setSlotsError('')
      setSlotsLoading(false)
      setReason('')
      setSymptoms('')
      
    } catch (err) {
      console.error('Error booking appointment:', err)
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedDoctorKey = selectedDoctor ? (selectedDoctor.id || selectedDoctor._id || getDoctorUserId(selectedDoctor)) : null
  const selectedDoctorIsBackend = Boolean(getDoctorUserId(selectedDoctor))
  const isTimeSelected = selectedDoctorIsBackend ? Boolean(selectedSlot) : Boolean(selectedTime)

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-lg text-gray-600">Select your location to find nearby doctors</p>
        </motion.div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-500 text-white p-4 rounded-lg flex items-center space-x-3 shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Appointment booked successfully! The doctor will be notified.</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center">
                <Navigation className="w-6 h-6 mr-2 text-primary" />
                Select Your Location
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {locations.map((location) => (
                  <motion.button
                    key={location}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleLocationSelect(location)}
                    className={`p-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                      selectedLocation === location
                        ? 'border-primary bg-secondary text-gray-900 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    <MapPin className="w-5 h-5 mx-auto mb-2" />
                    {location}
                  </motion.button>
                ))}
              </div>
            </Card>

            {selectedLocation && (
              <Card className="p-6">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Available Doctors in {selectedLocation}
                </h2>
                {nearbyDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {nearbyDoctors.map((doctor) => {
                      // Handle both backend format (userId.name) and mock data format (name)
                      const doctorName = doctor.name || doctor.userId?.name || 'Unknown'
                      const doctorId = doctor.id || doctor._id
                      const doctorUserId = getDoctorUserId(doctor)
                      const doctorKey = doctorId || doctorUserId || doctorName
                      const isSelected = selectedDoctorKey && doctorKey && selectedDoctorKey === doctorKey
                      const doctorImage = doctor.image || doctor.userId?.profileImage
                      const doctorSpecialty = doctor.specialty || doctor.specialization || 'General Practitioner'
                      const doctorExperience = typeof doctor.experience === 'number'
                        ? `${doctor.experience} years experience`
                        : doctor.experience || 'Experienced'
                      const doctorFee = doctor.consultationFee || 500
                      const doctorCity = doctor.city || doctor.location || doctor.hospitalAffiliation?.city || doctor.userId?.address?.city || selectedLocation
                      const doctorAddress = doctor.address || doctor.hospitalAffiliation?.address || ''
                      const doctorRating = doctor.rating || 4.5
                      const doctorAvailability = doctor.availability || (doctor.isAvailable === false ? 'Not Available' : 'Available Today')
                      const doctorAvailabilityClass = doctorAvailability === 'Not Available' ? 'bg-gray-400' : 'bg-success'
                      
                      return (
                        <motion.div
                          key={doctorKey}
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleDoctorSelect(doctor)}
                          className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'ring-2 ring-primary shadow-2xl'
                              : 'hover:shadow-xl border border-gray-200'
                          }`}
                        >
                          <Card className="h-full">
                            <div className="relative">
                              {doctorImage ? (
                                <img 
                                  src={doctorImage} 
                                  alt={doctorName}
                                  className="w-full h-48 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
                                  {doctorName.charAt(0)}
                                </div>
                              )}
                              <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-md">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-900">{doctorRating}</span>
                              </div>
                              <div className={`absolute bottom-3 left-3 ${doctorAvailabilityClass} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                                {doctorAvailability}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
                                {doctorName}
                              </h3>
                              <p className="text-sm text-primary font-medium mb-2">{doctorSpecialty}</p>
                              <p className="text-xs text-gray-600 mb-3">{doctorExperience}</p>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {doctorCity}
                                </div>
                                <span className="text-xs font-semibold text-gray-900">
                                  ₹{doctorFee}
                                </span>
                              </div>
                              {doctorAddress && (
                                <p className="text-xs text-gray-500 truncate">{doctorAddress}</p>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No doctors available in this location</p>
                )}
              </Card>
            )}

            {selectedDoctor && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleBooking}
                className="space-y-6"
              >
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Select Time
                  </label>
                  {selectedDoctorIsBackend ? (
                    <div className="space-y-3">
                      {!selectedDate && (
                        <p className="text-sm text-gray-500">Select a date to view available slots.</p>
                      )}
                      {selectedDate && slotsLoading && (
                        <p className="text-sm text-gray-500">Loading available slots...</p>
                      )}
                      {selectedDate && !slotsLoading && slotsError && (
                        <p className="text-sm text-red-600">{slotsError}</p>
                      )}
                      {selectedDate && !slotsLoading && !slotsError && availableSlots.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {availableSlots.map((slot) => {
                            const slotLabel = formatSlotLabel(slot)
                            const isSelected = selectedSlot?.startTime === slot.startTime

                            return (
                              <button
                                key={`${slot.startTime}-${slot.endTime}`}
                                type="button"
                                onClick={() => handleSlotSelect(slot, true)}
                                className={`p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                                  isSelected
                                    ? 'border-primary bg-secondary text-gray-900'
                                    : 'border-gray-200 text-gray-700 hover:border-primary'
                                }`}
                              >
                                {slotLabel}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {selectedDate && !slotsLoading && !slotsError && availableSlots.length === 0 && (
                        <p className="text-sm text-gray-500">No slots available for this date. Please try another day.</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleSlotSelect(time, false)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                            selectedTime === time
                              ? 'border-primary bg-secondary text-gray-900'
                              : 'border-gray-200 text-gray-700 hover:border-primary'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Reason for Visit *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="E.g., Regular checkup, flu symptoms, follow-up visit"
                    required
                  />
                </div>

                <div>
                  <label className="label">Symptoms (Optional)</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Describe any symptoms you're experiencing..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !isTimeSelected}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </motion.form>
            )}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Booking Summary</h2>
              {selectedLocation ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <p className="font-medium text-gray-900">{selectedLocation}</p>
                    </div>
                  </div>
                  {selectedDoctor && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Doctor</p>
                      <div className="flex items-center">
                        {(selectedDoctor.image || selectedDoctor.userId?.profileImage) ? (
                          <img
                            src={selectedDoctor.image || selectedDoctor.userId?.profileImage}
                            alt={selectedDoctor.name || selectedDoctor.userId?.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold border-2 border-primary mr-3">
                            {(selectedDoctor.name || selectedDoctor.userId?.name || 'D').charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{selectedDoctor.name || selectedDoctor.userId?.name}</p>
                          <p className="text-sm text-primary">{selectedDoctor.specialty || selectedDoctor.specialization}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedTime && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Time</p>
                      <p className="font-medium text-gray-900">{selectedTime}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Patient</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Select your location to begin</p>
              )}
            </Card>
          </div>
        </div>

        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Your Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((apt) => (
                <Card key={apt.id} className="p-6 border-l-4 border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-heading font-bold text-gray-900">Appointment Details</h3>
                    <span className="px-3 py-1 bg-success text-white text-xs font-semibold rounded-full uppercase">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 mb-4">
                    {apt.doctor.image ? (
                      <img
                        src={apt.doctor.image}
                        alt={apt.doctor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 border-primary">
                        {apt.doctor.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Doctor</p>
                      <h4 className="font-heading font-semibold text-gray-900 mb-1">{apt.doctor.name}</h4>
                      <p className="text-sm text-primary font-medium">{apt.doctor.specialty}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {apt.doctor.city}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-xs text-gray-500">Patient:</span>
                      </div>
                      <span className="font-medium text-gray-900">{apt.patientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-xs text-gray-500">Date:</span>
                      </div>
                      <span className="font-medium text-gray-900">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-xs text-gray-500">Time:</span>
                      </div>
                      <span className="font-medium text-gray-900">{apt.time}</span>
                    </div>
                    {apt.reason && (
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Reason for Visit:</p>
                        <p className="text-sm text-gray-700">{apt.reason}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Appointments