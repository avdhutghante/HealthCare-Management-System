import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, MapPin, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';
import Button from '../Button';

const DoctorAppointments = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [user.id]);

  useEffect(() => {
    const handleAppointmentsUpdated = () => loadAppointments();
    window.addEventListener('appointments:updated', handleAppointmentsUpdated);
    return () => window.removeEventListener('appointments:updated', handleAppointmentsUpdated);
  }, [user.id]);

  useEffect(() => {
    filterAppointments();
  }, [filter, appointments]);

  const loadAppointments = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const doctorAppointments = storedAppointments.filter(apt => {
      const doctorId = apt.doctor?.id;
      const userId = user.id;
      return doctorId == userId || String(doctorId) === String(userId);
    });
    setAppointments(doctorAppointments);
  };

  const filterAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [];
    if (filter === 'today') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === today.toDateString();
      });
    } else if (filter === 'upcoming') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= today;
      });
    } else if (filter === 'past') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate < today;
      });
    } else {
      filtered = appointments;
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredAppointments(filtered);
  };

  const handleDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = storedAppointments.filter(apt => apt.id !== appointmentToDelete.id);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments.filter(apt => {
      const doctorId = apt.doctor?.id;
      const userId = user.id;
      return doctorId == userId || String(doctorId) === String(userId);
    }));
    window.dispatchEvent(new CustomEvent('appointments:updated'));
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your appointments? This cannot be undone.')) {
      const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const otherAppointments = storedAppointments.filter(apt => {
        const doctorId = apt.doctor?.id;
        const userId = user.id;
        return !(doctorId == userId || String(doctorId) === String(userId));
      });
      localStorage.setItem('appointments', JSON.stringify(otherAppointments));
      setAppointments([]);
      setFilteredAppointments([]);
    }
  };

  const getStatusColor = (appointment) => {
    const aptDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (aptDate.toDateString() === today.toDateString()) {
      return 'border-green-500 bg-green-500/10';
    } else if (aptDate > today) {
      return 'border-blue-500 bg-blue-500/10';
    } else {
      return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusBadge = (appointment) => {
    const aptDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (aptDate.toDateString() === today.toDateString()) {
      return <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-300 dark:border-green-500/30">Today</span>;
    } else if (aptDate > today) {
      return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-300 dark:border-blue-500/30">Upcoming</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-500/30">Completed</span>;
    }
  };

  const stats = {
    all: appointments.length,
    today: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate.toDateString() === today.toDateString();
    }).length,
    upcoming: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate >= today;
    }).length,
    past: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate < today;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 text-gray-900 dark:text-white p-8">
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
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 font-medium"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </motion.button>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                My Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage all your patient appointments</p>
            </div>
            {filteredAppointments.length > 0 && (
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
            <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">Total</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.all}</p>
              </div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">Today</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.today}</p>
              </div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.upcoming}</p>
              </div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">Past</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.past}</p>
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
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
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
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
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

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No appointments found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {filter === 'today' ? "You don't have any appointments today" :
                     filter === 'upcoming' ? "No upcoming appointments scheduled" :
                     filter === 'past' ? "No past appointments to display" :
                     "No appointments scheduled yet"}
                  </p>
                </div>
              </Card>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-gray-800/50 backdrop-blur-sm border-l-4 ${getStatusColor(appointment)} hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Patient Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Patient Name</p>
                              <p className="font-semibold text-xl">{appointment.patientName || appointment.patient}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(appointment)}
                            <button
                              onClick={() => handleDelete(appointment)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                              title="Delete appointment"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Appointment Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Date</p>
                              <p className="text-gray-200 font-medium">
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Time</p>
                              <p className="text-gray-200 font-medium">{appointment.time}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <MapPin className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Status</p>
                              <p className="text-gray-200 font-medium capitalize">
                                {appointment.status || 'Confirmed'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        {appointment.reason && (
                          <div className="flex items-start gap-3 pt-4 border-t border-gray-700">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <FileText className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">Reason for Visit</p>
                              <p className="text-gray-300">{appointment.reason}</p>
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
            <h3 className="text-xl font-bold mb-4">Delete Appointment?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the appointment with {appointmentToDelete?.patientName}?
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

export default DoctorAppointments;
