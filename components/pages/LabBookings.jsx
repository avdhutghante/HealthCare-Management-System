import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, MapPin, Trash2, ArrowLeft, TestTube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';
import Button from '../Button';

const LabBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [user.id]);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const loadBookings = () => {
    const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]');
    const labBookings = storedBookings.filter(booking => {
      const labId = booking.lab?.id;
      const userId = user.id;
      return labId == userId || String(labId) === String(userId);
    });
    setBookings(labBookings);
  };

  const filterBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [];
    if (filter === 'today') {
      filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.toDateString() === today.toDateString();
      });
    } else if (filter === 'upcoming') {
      filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= today;
      });
    } else if (filter === 'past') {
      filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate < today;
      });
    } else {
      filtered = bookings;
    }

    filtered.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    setFilteredBookings(filtered);
  };

  const handleDelete = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]');
    const updatedBookings = storedBookings.filter(b => b.id !== bookingToDelete.id);
    localStorage.setItem('labBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings.filter(booking => {
      const labId = booking.lab?.id;
      const userId = user.id;
      return labId == userId || String(labId) === String(userId);
    }));
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all lab bookings? This cannot be undone.')) {
      const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]');
      const otherBookings = storedBookings.filter(booking => {
        const labId = booking.lab?.id;
        const userId = user.id;
        return !(labId == userId || String(labId) === String(userId));
      });
      localStorage.setItem('labBookings', JSON.stringify(otherBookings));
      setBookings([]);
      setFilteredBookings([]);
    }
  };

  const getStatusColor = (booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate.toDateString() === today.toDateString()) {
      return 'border-green-500 bg-green-500/10';
    } else if (bookingDate > today) {
      return 'border-blue-500 bg-blue-500/10';
    } else {
      return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusBadge = (booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate.toDateString() === today.toDateString()) {
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Today</span>;
    } else if (bookingDate > today) {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">Upcoming</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">Completed</span>;
    }
  };

  const stats = {
    all: bookings.length,
    today: bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate.toDateString() === today.toDateString();
    }).length,
    upcoming: bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate >= today;
    }).length,
    past: bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate < today;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </motion.button>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Test Bookings Management
              </h1>
              <p className="text-gray-400">Manage all your lab test bookings</p>
            </div>
            {filteredBookings.length > 0 && (
              <Button
                onClick={handleClearAll}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold text-purple-400">{stats.all}</p>
              </div>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Today</p>
                <p className="text-3xl font-bold text-green-400">{stats.today}</p>
              </div>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-400">{stats.upcoming}</p>
              </div>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Past</p>
                <p className="text-3xl font-bold text-gray-400">{stats.past}</p>
              </div>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm mb-6">
            <span className="text-gray-400 mr-2">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'today'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Today ({stats.today})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'upcoming'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'past'
                  ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Past ({stats.past})
            </button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <div className="text-center py-12">
                  <TestTube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No bookings found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {filter === 'today' ? "You don't have any test bookings today" :
                     filter === 'upcoming' ? "No upcoming test bookings scheduled" :
                     filter === 'past' ? "No past test bookings to display" :
                     "No test bookings scheduled yet"}
                  </p>
                </div>
              </Card>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-gray-800/50 backdrop-blur-sm border-l-4 ${getStatusColor(booking)} hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Patient Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Patient Name</p>
                              <p className="font-semibold text-xl">{booking.patientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(booking)}
                            <button
                              onClick={() => handleDelete(booking)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                              title="Delete booking"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Date</p>
                              <p className="text-gray-200 font-medium">
                                {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Time</p>
                              <p className="text-gray-200 font-medium">{booking.timeSlot}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <MapPin className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Status</p>
                              <p className="text-gray-200 font-medium capitalize">
                                {booking.status || 'Scheduled'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tests */}
                        {booking.tests && booking.tests.length > 0 && (
                          <div className="flex items-start gap-3 pt-4 border-t border-gray-700">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <FileText className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-2">Tests Booked</p>
                              <div className="flex flex-wrap gap-2">
                                {booking.tests.map((test, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                    {test.name}
                                  </span>
                                ))}
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                Total: ₹{booking.totalPrice}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Delete Booking?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the test booking for {bookingToDelete?.patientName}?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LabBookings;
