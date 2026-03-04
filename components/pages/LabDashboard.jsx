import { motion } from 'framer-motion';
import { TestTube, Calendar, Users, ClipboardCheck, TrendingUp, Filter, FileText, MapPin, Clock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';

const LabDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('labBookings') || '[]');
    
    console.log('All bookings:', storedBookings);
    console.log('User ID:', user.id, 'Type:', typeof user.id);
    
    const labBookings = storedBookings.filter(booking => {
      const labId = booking.lab?.id;
      const userId = user.id;
      return labId == userId || String(labId) === String(userId);
    });
    
    console.log('Lab bookings filtered:', labBookings);
    
    setBookings(labBookings);
    
    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = labBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.toDateString() === today.toDateString();
    }).length;
    
    const upcomingCount = labBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= today && booking.status === 'scheduled';
    }).length;
    
    const completedCount = labBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate < today || booking.status === 'completed';
    }).length;
    
    setStats({
      total: labBookings.length,
      today: todayCount,
      upcoming: upcomingCount,
      completed: completedCount
    });
  }, [user.id]);

  useEffect(() => {
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
  }, [filter, bookings]);

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
      return <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/50 rounded-full text-xs font-semibold">Today</span>;
    } else if (bookingDate > today) {
      return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/50 rounded-full text-xs font-semibold">Upcoming</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-500/50 rounded-full text-xs font-semibold">Completed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 text-gray-900 dark:text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Lab Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Welcome back, {user.name}
              </p>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/lab-bookings')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <TestTube className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate('/lab-bookings')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Today's Tests</p>
                    <p className="text-3xl font-bold">{stats.today}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-200 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate('/lab-bookings')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/lab-bookings')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-gray-600 to-gray-700 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-100 text-sm mb-1">Completed</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <ClipboardCheck className="w-12 h-12 text-gray-300 opacity-80" />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 flex-wrap bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 mr-2">Filter:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'today'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Today ({stats.today})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'upcoming'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'past'
                    ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Past
              </button>
            </div>
          </motion.div>

          {/* Bookings List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              {filter === 'all' ? 'All Test Bookings' : 
               filter === 'today' ? "Today's Test Bookings" :
               filter === 'upcoming' ? 'Upcoming Test Bookings' :
               'Past Test Bookings'}
            </h2>
            
            {filteredBookings.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-center py-12">
                  <TestTube className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No bookings found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    {filter === 'today' ? "You don't have any test bookings today" :
                     filter === 'upcoming' ? "No upcoming test bookings scheduled" :
                     filter === 'past' ? "No past test bookings to display" :
                     "No test bookings scheduled yet"}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`bg-white dark:bg-gray-800/50 backdrop-blur-sm border-l-4 ${getStatusColor(booking)} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Patient Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Patient Name</p>
                                <p className="font-semibold text-xl text-gray-900 dark:text-white">{booking.patientName}</p>
                              </div>
                            </div>
                            {getStatusBadge(booking)}
                          </div>

                          {/* Booking Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">
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
                              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{booking.timeSlot}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium capitalize">
                                  {booking.status || 'Scheduled'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tests */}
                          {booking.tests && booking.tests.length > 0 && (
                            <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tests Booked</p>
                                <div className="flex flex-wrap gap-2">
                                  {booking.tests.map((test, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                      {test.name}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                                  Total: ₹{booking.totalPrice}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LabDashboard;
