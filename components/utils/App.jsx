import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './ThemeContext'
import Navbar from '../Navbar'
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/AdminDashboard'
import ManageDoctors from '../pages/ManageDoctors'
import ManageLabs from '../pages/ManageLabs'
import DoctorDashboard from '../pages/DoctorDashboard'
import DoctorAppointments from '../pages/DoctorAppointments'
import LabDashboard from '../pages/LabDashboard'
import LabBookings from '../pages/LabBookings'
import Registration from '../pages/Registration'
import Login from '../pages/Login'
import Appointments from '../pages/Appointments'
import MyAppointments from '../pages/MyAppointments'
import LabTests from '../pages/LabTest'
import MyLabTests from '../pages/MyLabTests'
import VisitHistory from '../pages/VisitHistory'
import BMICalculator from '../pages/BMICalculator'
import Chatbot from '../pages/Chatbox'
import AISymptomChecker from '../pages/AISymptomChecker'
import HeartDisease from '../pages/HeartDisease'
import BookAppointment from '../pages/BookAppointment'
import RealTimeSyncStatus from '../RealTimeSyncStatus'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)

      const normalizedRole = (userData.role || '').toLowerCase()
      if (normalizedRole === 'patient' && userData.name) {
        try {
          const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
          let updated = false
          const migratedAppointments = appointments.map(apt => {
            const patientName = (apt.patientName || '').trim().toLowerCase()
            const doctorName = (apt.doctor?.name || '').trim().toLowerCase()

            if (!patientName || patientName === 'you' || (doctorName && patientName === doctorName)) {
              updated = true
              return { ...apt, patientName: userData.name }
            }
            return apt
          })

          if (updated) {
            localStorage.setItem('appointments', JSON.stringify(migratedAppointments))
            console.log(`Migrated appointments for patient ${userData.name}`)
          }
        } catch (err) {
          console.error('Error migrating appointments:', err)
        }
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUser')
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
          {isAuthenticated && <RealTimeSyncStatus />}
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Registration onRegister={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={isAuthenticated ? (
              user?.role === 'admin' ? <AdminDashboard user={user} /> :
              user?.role === 'doctor' ? <DoctorDashboard user={user} /> : 
              user?.role === 'lab' ? <LabDashboard user={user} /> : 
              <Dashboard user={user} />
            ) : <Navigate to="/login" />} />
            <Route path="/appointments" element={isAuthenticated ? <Appointments user={user} /> : <Navigate to="/login" />} />
            <Route path="/my-appointments" element={isAuthenticated ? <MyAppointments user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin/manage-doctors" element={isAuthenticated && user?.role === 'admin' ? <ManageDoctors /> : <Navigate to="/login" />} />
            <Route path="/admin/manage-labs" element={isAuthenticated && user?.role === 'admin' ? <ManageLabs /> : <Navigate to="/login" />} />
            <Route path="/doctor-appointments" element={isAuthenticated && user?.role === 'doctor' ? <DoctorAppointments user={user} /> : <Navigate to="/login" />} />
            <Route path="/lab-bookings" element={isAuthenticated && user?.role === 'lab' ? <LabBookings user={user} /> : <Navigate to="/login" />} />
            <Route path="/lab-tests" element={isAuthenticated ? <LabTests user={user} /> : <Navigate to="/login" />} />
            <Route path="/my-lab-tests" element={isAuthenticated ? <MyLabTests user={user} /> : <Navigate to="/login" />} />
            <Route path="/visit-history" element={isAuthenticated ? <VisitHistory user={user} /> : <Navigate to="/login" />} />
            <Route path="/bmi-calculator" element={isAuthenticated ? <BMICalculator user={user} /> : <Navigate to="/login" />} />
            <Route path="/heart-disease" element={isAuthenticated ? <HeartDisease user={user} /> : <Navigate to="/login" />} />
            <Route path="/chatbot" element={isAuthenticated ? <Chatbot user={user} /> : <Navigate to="/login" />} />
            <Route path="/ai-symptom-checker" element={isAuthenticated ? <AISymptomChecker user={user} /> : <Navigate to="/login" />} />
            <Route path="/book-appointment" element={isAuthenticated ? <BookAppointment user={user} /> : <Navigate to="/login" />} />

            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>

      </Router>
    </ThemeProvider>
  )
}

export default App