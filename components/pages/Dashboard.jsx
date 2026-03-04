import { motion } from 'framer-motion'
import { Calendar, TestTube, Calculator, MessageSquare, Activity, Clock, MapPin, Star, User, ChevronDown, Brain } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doctorsWithLocation } from '../data/mockData'
import { Link } from 'react-router-dom'
import Card from '../Card'
import { appointmentAPI } from '../utils/api'
import realTimeSync from '../utils/realTimeSync'

const Dashboard = ({ user }) => {
  const [userLocation, setUserLocation] = useState('Pune')
  const [todayAppointments, setTodayAppointments] = useState([])
  const [stats, setStats] = useState([
    { label: 'Upcoming Appointments', value: '0', icon: Calendar, color: 'text-blue-600' },
    { label: 'Lab Tests', value: '0', icon: TestTube, color: 'text-green-600' },
    { label: 'Health Score', value: '85%', icon: Activity, color: 'text-purple-600' },
    { label: 'Last Visit', value: '5 days ago', icon: Clock, color: 'text-orange-600' }
  ])

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a consultation with our doctors',
      icon: Calendar,
      path: '/appointments',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Lab Tests',
      description: 'Book lab tests and view results',
      icon: TestTube,
      path: '/lab-tests',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'BMI Calculator',
      description: 'Check your body mass index',
      icon: Calculator,
      path: '/bmi-calculator',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'AI Symptom Checker',
      description: 'AI-powered symptom analysis',
      icon: Brain,
      path: '/ai-symptom-checker',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with our virtual health assistant',
      icon: MessageSquare,
      path: '/chatbot',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    }
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Try to fetch from backend first
        const appointmentsResponse = await appointmentAPI.getMyAppointments({ limit: 100 })
        const backendAppointments = appointmentsResponse.data?.data || []
        
        // Fallback to localStorage if backend fails
        const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
        
        // Use backend data if available, otherwise use local
        const appointments = backendAppointments.length > 0 ? 
          backendAppointments.map(apt => ({
            date: apt.appointmentDate,
            status: apt.status,
            patientName: user?.name || 'You',
            doctor: {
              name: apt.doctorId?.name || 'Doctor',
              specialty: apt.doctorId?.specialty || 'General',
              image: apt.doctorId?.profileImage || '',
              address: apt.doctorId?.address || ''
            },
            timeSlot: { label: `${apt.timeSlot?.startTime || ''} - ${apt.timeSlot?.endTime || ''}` }
          })) : localAppointments
        
        const labBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
        const latestBMI = JSON.parse(localStorage.getItem('latestBMI') || null)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingAppointmentsCount = appointments.filter(apt => {
          const aptDate = new Date(apt.date || apt.appointmentDate)
          return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'scheduled') && 
                 (apt.patientName === user?.name || !apt.patientName)
        }).length

        const todayAppointmentsFiltered = appointments.filter(apt => {
          const aptDate = new Date(apt.date || apt.appointmentDate)
          return aptDate.toDateString() === today.toDateString() && 
                 (apt.patientName === user?.name || !apt.patientName) && 
                 (apt.status === 'confirmed' || apt.status === 'scheduled')
        })

        const totalLabTests = labBookings.filter(booking => {
          return booking.patientName === user?.name
        }).length

        // Calculate health score based on BMI and appointments
        let healthScore = 85 // base score
        if (latestBMI) {
          const bmiValue = parseFloat(latestBMI.bmi)
          if (bmiValue >= 18.5 && bmiValue < 25) {
            healthScore += 10 // normal weight bonus
          } else if (bmiValue >= 25 && bmiValue < 30) {
            healthScore += 5 // overweight moderate bonus
          } else if (bmiValue < 18.5 || bmiValue >= 30) {
            healthScore -= 10 // underweight or obese penalty
          }
        }
        if (upcomingAppointmentsCount > 0) {
          healthScore += Math.min(upcomingAppointmentsCount * 2, 10) // appointment regularity bonus
        }

        healthScore = Math.max(0, Math.min(100, healthScore)) // clamp between 0-100

        // Calculate last visit
        const pastAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date || apt.appointmentDate)
          return aptDate < today && (apt.patientName === user?.name || !apt.patientName)
        })
        const pastLabBookings = labBookings.filter(booking => {
          const bookingDate = new Date(booking.bookingDate || booking.date)
          return bookingDate < today && booking.patientName === user?.name
        })
        
        const allPastVisits = [
          ...pastAppointments.map(apt => ({ date: apt.date || apt.appointmentDate })),
          ...pastLabBookings.map(booking => ({ date: booking.bookingDate || booking.date }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
        
        let lastVisitText = 'No visits yet'
        if (allPastVisits.length > 0) {
          const lastVisitDate = new Date(allPastVisits[0].date)
          const diffTime = Math.abs(today - lastVisitDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) lastVisitText = 'Today'
          else if (diffDays === 1) lastVisitText = '1 day ago'
          else if (diffDays < 7) lastVisitText = `${diffDays} days ago`
          else if (diffDays < 30) lastVisitText = `${Math.floor(diffDays / 7)} weeks ago`
          else if (diffDays < 365) lastVisitText = `${Math.floor(diffDays / 30)} months ago`
          else lastVisitText = `${Math.floor(diffDays / 365)} years ago`
        }

        setTodayAppointments(todayAppointmentsFiltered)
        setStats(prevStats => prevStats.map(stat => {
          if (stat.label === 'Upcoming Appointments') {
            return { ...stat, value: upcomingAppointmentsCount.toString() }
          } else if (stat.label === 'Lab Tests') {
            return { ...stat, value: totalLabTests.toString() }
          } else if (stat.label === 'Health Score') {
            return { ...stat, value: healthScore.toString() }
          } else if (stat.label === 'Last Visit') {
            return { ...stat, value: lastVisitText }
          }
          return stat
        }))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Fallback to localStorage only
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
        const labBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
        const latestBMI = JSON.parse(localStorage.getItem('latestBMI') || null)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingAppointmentsCount = appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate >= today && apt.status === 'confirmed' && apt.patientName === user?.name
        }).length

        const todayAppointmentsFiltered = appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate.toDateString() === today.toDateString() && apt.patientName === user?.name && apt.status === 'confirmed'
        })

        const totalLabTests = labBookings.filter(booking => {
          return booking.patientName === user?.name
        }).length

        let healthScore = 85
        if (latestBMI) {
          const bmiValue = parseFloat(latestBMI.bmi)
          if (bmiValue >= 18.5 && bmiValue < 25) {
            healthScore += 10
          } else if (bmiValue >= 25 && bmiValue < 30) {
            healthScore += 5
          } else if (bmiValue < 18.5 || bmiValue >= 30) {
            healthScore -= 10
          }
        }
        if (upcomingAppointmentsCount > 0) {
          healthScore += Math.min(upcomingAppointmentsCount * 2, 10)
        }
        healthScore = Math.max(0, Math.min(100, healthScore))

        const pastAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate < today && apt.patientName === user?.name
        })
        const pastLabBookings = labBookings.filter(booking => {
          const bookingDate = new Date(booking.bookingDate || booking.date)
          return bookingDate < today && booking.patientName === user?.name
        })
        
        const allPastVisits = [
          ...pastAppointments.map(apt => ({ date: apt.date })),
          ...pastLabBookings.map(booking => ({ date: booking.bookingDate || booking.date }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
        
        let lastVisitText = 'No visits yet'
        if (allPastVisits.length > 0) {
          const lastVisitDate = new Date(allPastVisits[0].date)
          const diffTime = Math.abs(today - lastVisitDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) lastVisitText = 'Today'
          else if (diffDays === 1) lastVisitText = '1 day ago'
          else if (diffDays < 7) lastVisitText = `${diffDays} days ago`
          else if (diffDays < 30) lastVisitText = `${Math.floor(diffDays / 7)} weeks ago`
          else if (diffDays < 365) lastVisitText = `${Math.floor(diffDays / 30)} months ago`
          else lastVisitText = `${Math.floor(diffDays / 365)} years ago`
        }

        setTodayAppointments(todayAppointmentsFiltered)
        setStats(prevStats => prevStats.map(stat => {
          if (stat.label === 'Upcoming Appointments') {
            return { ...stat, value: upcomingAppointmentsCount.toString() }
          } else if (stat.label === 'Lab Tests') {
            return { ...stat, value: totalLabTests.toString() }
          } else if (stat.label === 'Health Score') {
            return { ...stat, value: healthScore.toString() }
          } else if (stat.label === 'Last Visit') {
            return { ...stat, value: lastVisitText }
          }
          return stat
        }))
      }
    }
    
    // Only call once on mount and when user.name changes
    if (user?.name) {
      loadDashboardData()
    }
  }, [user?.name])

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Here's your health dashboard overview</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {stat.label === 'Upcoming Appointments' || stat.label === 'Lab Tests' || stat.label === 'Last Visit' ? (
                <Link to={
                  stat.label === 'Upcoming Appointments' ? '/my-appointments' : 
                  stat.label === 'Lab Tests' ? '/my-lab-tests' : 
                  '/visit-history'
                }>
                  <Card 
                    className="text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 relative bg-white dark:bg-gray-800"
                  >
                    <stat.icon className={`w-10 h-10 ${stat.color} mx-auto mb-3`} />
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <div className="flex items-center justify-center mt-2 text-primary dark:text-blue-400">
                      <p className="text-xs font-medium mr-1">
                        {stat.label === 'Last Visit' ? 'View history' : 'Click to view all'}
                      </p>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="text-center bg-white dark:bg-gray-800">
                  <stat.icon className={`w-10 h-10 ${stat.color} mx-auto mb-3`} />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                </Card>
              )}
            </motion.div>
          ))}
        </div>

        {todayAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary dark:text-blue-400" />
              Today's Appointments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayAppointments.map((apt, index) => {
                const fallbackImage = 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop'
                const doctorInfo = apt?.doctor || {}
                const doctorName = doctorInfo.name || apt?.doctorName || 'Doctor'
                const doctorSpecialty = doctorInfo.specialty || apt?.doctorSpecialty || 'General Consultation'
                const doctorImage = doctorInfo.image || apt?.doctorImage || fallbackImage
                const doctorAddress = doctorInfo.address || apt?.doctorAddress || 'Clinic details not available'
                const appointmentStatus = (apt?.status || 'scheduled').toString()
                const patientName = apt?.patientName || user?.name || 'You'
                const appointmentTime = apt?.time || apt?.timeSlot?.label || 'Time not set'

                return (
                  <motion.div
                    key={apt.id || `${doctorName}-${appointmentTime}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="p-6 border-l-4 border-primary">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Today's Appointment</span>
                        <span className="px-2 py-1 bg-success text-white text-xs font-semibold rounded-full">
                          {appointmentStatus}
                        </span>
                      </div>
                      <div className="flex items-start space-x-4 mb-3">
                        <img
                          src={doctorImage}
                          alt={doctorName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Doctor</p>
                          <h3 className="font-heading font-semibold text-gray-900 mb-1">{doctorName}</h3>
                          <p className="text-sm text-primary font-medium">{doctorSpecialty}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-xs">Patient:</span>
                          </div>
                          <span className="font-medium text-gray-900">{patientName}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-xs">Time:</span>
                          </div>
                          <span className="font-medium text-gray-900">{appointmentTime}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-xs">{doctorAddress}</span>
                        </div>
                      </div>
                      {doctorName === 'Dr. Sarah Johnson' && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-xs text-yellow-800 font-medium">⭐ Featured Doctor</p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Doctors Near You</h2>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">{userLocation}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsWithLocation.slice(0, 3).map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <Link to="/appointments">
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">{doctor.rating}</span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-success text-white px-3 py-1 rounded-full text-xs font-medium">
                        {doctor.distance}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-2">{doctor.specialty}</p>
                      <p className="text-xs text-gray-600 mb-3">{doctor.experience}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {doctor.city}
                        </div>
                        <span className="text-xs bg-secondary text-primary px-2 py-1 rounded">
                          {doctor.availability}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <Link to={action.path}>
                  <Card className="group cursor-pointer hover:scale-105 transition-transform duration-300 bg-white dark:bg-gray-800">
                    <div className={`${action.color} ${action.hoverColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard