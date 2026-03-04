import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TestTube, Calendar, Clock, CheckCircle, DollarSign, MapPin, Star, Building2 } from 'lucide-react'
import { labTests, labTimeSlots, labsWithLocation, locations } from '../data/mockData'
import Button from '../Button'
import Card from '../Card'

const LabTests = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [nearbyLabs, setNearbyLabs] = useState([])
  const [selectedLab, setSelectedLab] = useState(null)
  const [selectedTests, setSelectedTests] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookings, setBookings] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)

  // Load existing bookings from localStorage on mount
  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
    const userBookings = storedBookings.filter(booking => booking.patientName === user?.name)
    console.log('LabTest - Loading bookings for user:', user?.name)
    console.log('LabTest - User bookings found:', userBookings)
    setBookings(userBookings)
  }, [user?.name])

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    const filtered = labsWithLocation.filter(lab => lab.city === location)
    setNearbyLabs(filtered)
    setSelectedLab(null)
    setSelectedTests([])
  }

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.find(t => t.id === test.id)
        ? prev.filter(t => t.id !== test.id)
        : [...prev, test]
    )
  }

  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0)

  const handleBooking = (e) => {
    e.preventDefault()
    if (selectedLab && selectedTests.length > 0 && selectedDate && selectedTime) {
      const newBooking = {
        id: Date.now(),
        lab: selectedLab,
        tests: selectedTests,
        bookingDate: selectedDate,
        timeSlot: selectedTime,
        totalPrice,
        status: 'scheduled',
        patientName: user.name,
        bookedAt: new Date().toISOString()
      }
      const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]')
      storedBookings.push(newBooking)
      localStorage.setItem('labBookings', JSON.stringify(storedBookings))
      
      console.log('✅ Booking lab test with:', selectedLab.name, 'Lab ID:', selectedLab.id);
      console.log('✅ Full booking object:', newBooking);
      console.log('✅ Total bookings in localStorage:', storedBookings.length);
      
      setBookings([...bookings, newBooking])
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      setSelectedLab(null)
      setSelectedTests([])
      setSelectedDate('')
      setSelectedTime('')
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Book Lab Tests</h1>
          <p className="text-lg text-gray-600">Select your location to find nearby labs</p>
        </motion.div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-success text-white p-4 rounded-lg flex items-center space-x-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Lab tests booked successfully!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Location Selection */}
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-primary" />
                Select Your Location
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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

            {/* Lab Selection */}
            {selectedLocation && nearbyLabs.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center">
                  <Building2 className="w-6 h-6 mr-2 text-primary" />
                  Select Lab ({nearbyLabs.length} available in {selectedLocation})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyLabs.map((lab) => (
                    <motion.div
                      key={lab.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedLab(lab)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedLab?.id === lab.id
                          ? 'border-primary bg-secondary shadow-md'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{lab.name}</h3>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{lab.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lab.address}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{lab.distance}</span>
                        <span>{lab.openTime} - {lab.closeTime}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lab.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Test Selection */}
            {selectedLab && (
              <Card className="p-6">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Available Tests</h2>
              <div className="space-y-4 mb-8">
                {labTests.map((test) => (
                  <motion.div
                    key={test.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleTest(test)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTests.find(t => t.id === test.id)
                        ? 'border-primary bg-secondary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <TestTube className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-gray-900 mb-1">{test.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-primary font-medium">${test.price}</span>
                            <span className="text-gray-500">{test.duration}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              test.fasting ? 'bg-warning text-gray-900' : 'bg-success text-white'
                            }`}>
                              {test.fasting ? 'Fasting Required' : 'No Fasting'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedTests.find(t => t.id === test.id)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedTests.find(t => t.id === test.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {selectedTests.length > 0 && (
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
                      onChange={(e) => setSelectedDate(e.target.value)}
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {labTimeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
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
                  </div>

                  <Button type="submit" className="w-full">
                    Confirm Booking
                  </Button>
                </motion.form>
              )}
            </Card>
            )}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Booking Summary</h2>
              {selectedTests.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selected Tests</p>
                    <div className="space-y-2">
                      {selectedTests.map((test) => (
                        <div key={test.id} className="flex justify-between items-start">
                          <span className="text-sm text-gray-900">{test.name}</span>
                          <span className="text-sm font-medium text-primary">${test.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-heading font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Select tests to begin</p>
              )}
            </Card>
          </div>
        </div>

        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Your Lab Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-gray-900">Lab Tests</h3>
                      {booking.lab && (
                        <p className="text-sm text-blue-600 font-medium mt-1">📍 {booking.lab.name}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-success text-white text-xs rounded-full">
                      {booking.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {booking.tests.map((test) => (
                      <p key={test.id} className="text-sm text-gray-600">• {test.name}</p>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(booking.bookingDate || booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {booking.timeSlot || booking.time}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Total
                      </span>
                      <span className="font-bold text-primary">₹{booking.totalPrice}</span>
                    </div>
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

export default LabTests