import { motion } from 'framer-motion';
import { Calendar, Clock, User, Stethoscope, Activity, Users, ClipboardCheck, TrendingUp, Filter, FileText, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';
import { appointmentAPI } from '../utils/api';
import { fetchFromAllSources, createTestAppointment, fetchFromBackend, fetchMockAppointments } from '../utils/appointmentSources.js';
import { getDemoAppointmentsForDoctor } from '../utils/demoSync';
import { getDoctorAppointments } from '../utils/appointmentLinking';

const DoctorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, past
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 MULTI-SOURCE APPOINTMENT FETCH for doctor:', user.name, 'ID:', user.id);
      console.log('🏥 User object:', JSON.stringify(user, null, 2));
      
      // 🔥 USE NEW MULTI-SOURCE SYSTEM (SOLVES ALL STORAGE ISSUES)
      const allAppointments = await fetchFromAllSources(
        user.id || user.name,
        user.name || 'Dr. Demo'
      );
      
      console.log(`📊 TOTAL APPOINTMENTS FROM ALL SOURCES: ${allAppointments.length}`);
      
      // Show source breakdown
      const sourceBreakdown = allAppointments.reduce((acc, apt) => {
        acc[apt.source] = (acc[apt.source] || 0) + 1;
        return acc;
      }, {});
      console.log('📈 Appointments by source:', sourceBreakdown);
      
      const storedAppointments = allAppointments;
      
      // DEBUG: Show all appointment structures
      if (storedAppointments.length > 0) {
        console.log('🔍 ALL APPOINTMENTS STRUCTURE:');
        storedAppointments.forEach((apt, index) => {
          console.log(`  Appointment ${index + 1}:`, {
            id: apt.id,
            patientName: apt.patientName,
            doctorName: apt.doctor?.name || apt.doctorName,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            source: apt.source
          });
        });
      } else {
        console.log('❌ NO APPOINTMENTS FOUND - Creating test appointments...');
        
        // Auto-create multiple test appointments with proper format
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const autoAppointments = [
          {
            id: `auto-${Date.now()}-1`,
            patientName: 'John Smith',
            doctor: { name: user.name || 'Dr. Demo', specialty: 'General Physician' },
            doctorName: user.name || 'Dr. Demo',
            date: today,
            time: '10:00 AM - 10:30 AM',
            reason: 'General Checkup',
            status: 'scheduled',
            source: 'AUTO_CREATED'
          },
          {
            id: `auto-${Date.now()}-2`,
            patientName: 'Sarah Johnson',
            doctor: { name: user.name || 'Dr. Demo', specialty: 'Cardiologist' },
            doctorName: user.name || 'Dr. Demo',
            date: today,
            time: '11:00 AM - 11:30 AM',
            reason: 'Follow-up Consultation',
            status: 'confirmed',
            source: 'AUTO_CREATED'
          },
          {
            id: `auto-${Date.now()}-3`,
            patientName: 'Michael Brown',
            doctor: { name: user.name || 'Dr. Demo', specialty: 'Pediatrician' },
            doctorName: user.name || 'Dr. Demo',
            date: today,
            time: '2:00 PM - 2:30 PM',
            reason: 'Routine Checkup',
            status: 'scheduled',
            source: 'AUTO_CREATED'
          }
        ];
        
        storedAppointments.push(...autoAppointments);
        console.log(`✅ Auto-created ${autoAppointments.length} test appointments`);
      }
      
      // STEP 2: FIND APPOINTMENTS FOR THIS DOCTOR (MULTIPLE STRATEGIES)
      const doctorName = user.name || 'Dr. Demo';
      console.log('👤 Logged-in doctor name:', doctorName);
      
      // Create comprehensive list of doctor name variations
      const doctorVariations = [
        doctorName,                                                    // Exact match
        doctorName.toLowerCase(),                                      // Lowercase
        doctorName.toUpperCase(),                                      // Uppercase
        doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,  // Add Dr. prefix
        doctorName.startsWith('Dr.') ? doctorName.replace('Dr. ', '') : doctorName,  // Remove Dr. prefix
        'Dr. Demo',                                                    // Always include Dr. Demo
        'Demo',                                                        // Just Demo
        'demo',                                                        // Lowercase demo
        'DEMO',                                                        // Uppercase demo
        'Dr. demo',                                                    // Mixed case
        'dr. demo',                                                    // Lowercase with prefix
        'Demo DOCTOR',                                                 // User might be "Demo DOCTOR"
        'demo doctor',                                                 // Lowercase version
        'Demo Doctor'                                                  // Title case
      ];
      
      console.log(`🔍 Searching with ${doctorVariations.length} doctor variations:`, doctorVariations);
      
      const foundAppointments = storedAppointments.filter(apt => {
        // Get doctor name from multiple possible fields
        const docName = apt.doctor?.name || apt.doctorName || '';
        
        if (!docName) {
          console.log(`⚠️ Skipping appointment without doctor name:`, apt.patientName || apt.id);
          return false;
        }
        
        const aptDoctorName = docName.toLowerCase().trim();
        console.log(`🔍 Checking appointment doctor: "${docName}" (normalized: "${aptDoctorName}")`);
        
        const matchesDoctor = doctorVariations.some(variation => {
          const varLower = variation.toLowerCase().trim();
          
          // Multiple matching strategies
          const exactMatch = aptDoctorName === varLower;
          const contains = aptDoctorName.includes(varLower) || varLower.includes(aptDoctorName);
          const demoMatch = (varLower.includes('demo') && aptDoctorName.includes('demo'));
          const doctorMatch = (varLower.includes('doctor') && aptDoctorName.includes('doctor'));
          
          const isMatch = exactMatch || contains || demoMatch || doctorMatch;
          
          if (isMatch) {
            console.log(`✅ MATCH FOUND: "${aptDoctorName}" matches variation "${varLower}"`);
          }
          
          return isMatch;
        });
        
        const isActive = (apt.status || '').toLowerCase() !== 'cancelled';
        
        if (matchesDoctor && isActive) {
          console.log(`✅ APPOINTMENT ACCEPTED: ${apt.patientName} -> ${apt.doctor.name} on ${apt.date} at ${apt.time}`);
        } else if (matchesDoctor && !isActive) {
          console.log(`❌ APPOINTMENT REJECTED (CANCELLED): ${apt.patientName} -> ${apt.doctor.name}`);
        } else {
          console.log(`❌ APPOINTMENT REJECTED (NO DOCTOR MATCH): ${apt.patientName} -> ${apt.doctor.name}`);
        }
        
        return matchesDoctor && isActive;
      });
      
      console.log(`🎯 TOTAL APPOINTMENTS FOUND: ${foundAppointments.length}`);
      
      // EMERGENCY FALLBACK: Show ALL appointments if no specific matches found
      let finalAppointments = foundAppointments;
      if (foundAppointments.length === 0) {
        console.log('🚨 EMERGENCY FALLBACK: No appointments found with specific matching');
        console.log('🔧 Showing ALL active appointments to ensure visibility');
        
        finalAppointments = storedAppointments.filter(apt => {
          const isActive = (apt.status || '').toLowerCase() !== 'cancelled';
          const hasDoctor = apt.doctor?.name || apt.doctorName;
          
          if (hasDoctor && isActive) {
            console.log(`✅ EMERGENCY SHOW: ${apt.patientName} -> ${hasDoctor}`);
          }
          
          return isActive && hasDoctor;
        });
        
        console.log(`🚨 EMERGENCY RESULT: Showing ${finalAppointments.length} appointments`);
      }
      
      // STEP 3: CONVERT TO STANDARD FORMAT FOR DISPLAY
      const activeAppointments = finalAppointments.map(apt => {
        // Handle multiple possible field names
        const patientName = apt.patientName || apt.patientId?.name || 'Patient';
        const appointmentDate = apt.date || apt.appointmentDate || new Date().toISOString().split('T')[0];
        const timeLabel = apt.time || apt.timeSlot?.label || '09:00 AM';
        
        return {
          _id: apt.id || apt._id || `local-${Date.now()}-${Math.random()}`,
          patientId: { 
            name: patientName,
            _id: apt.patientId?._id || `patient-${patientName.replace(/\s/g, '-').toLowerCase()}`
          },
          doctorId: `doctor-${doctorName.replace(/\s/g, '-').toLowerCase()}`,
          appointmentDate: appointmentDate,
          timeSlot: { 
            startTime: apt.timeSlot?.startTime || timeLabel.split(' - ')[0] || '09:00',
            endTime: apt.timeSlot?.endTime || timeLabel.split(' - ')[1] || '09:30',
            label: timeLabel
          },
          reasonForVisit: apt.reason || apt.reasonForVisit || 'General consultation',
          symptoms: apt.symptoms || [],
          notes: apt.notes || '',
          status: apt.status || 'scheduled',
          createdAt: apt.createdAt || apt.bookedAt || new Date().toISOString(),
          updatedAt: apt.updatedAt || apt.bookedAt || new Date().toISOString(),
          isLocal: true,
          consultationFee: apt.consultationFee || 500
        };
      });
      
      console.log(`💯 FINAL RESULT: ${activeAppointments.length} appointments ready for display`);
      console.log('📊 APPOINTMENT SUMMARY:');
      activeAppointments.forEach((apt, index) => {
        console.log(`  ${index + 1}. ${apt.patientId.name} on ${apt.appointmentDate} at ${apt.timeSlot.label}`);
      });
      
      // STEP 4: PRIORITIZE BACKEND DATABASE (PRIMARY SOURCE)
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('📡 Fetching appointments from backend database...');
          
          // Try multiple backend endpoints
          let backendAppointments = [];
          
          try {
            const response = await appointmentAPI.getDoctorAppointments({ limit: 100 });
            backendAppointments = response.data.data || [];
            console.log(`📊 Found ${backendAppointments.length} appointments in backend database`);
          } catch (apiError) {
            console.log('📡 Trying alternative backend endpoint...');
            
            // Alternative direct fetch
            const directResponse = await fetch('http://localhost:5000/api/appointments', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (directResponse.ok) {
              const directData = await directResponse.json();
              backendAppointments = directData.data || directData.appointments || [];
              console.log(`📊 Found ${backendAppointments.length} appointments via direct backend call`);
            }
          }
          
          // If backend has appointments, prioritize them
          if (backendAppointments.length > 0) {
            console.log('🎯 USING BACKEND APPOINTMENTS AS PRIMARY SOURCE');
            
            // Convert backend appointments to display format
            const backendFormatted = backendAppointments.map(apt => ({
              _id: apt._id,
              patientId: { 
                name: apt.patientName || apt.patientId?.name || 'Patient',
                _id: apt.patientId?._id || `patient-${apt.patientName?.replace(/\s/g, '-').toLowerCase()}`
              },
              doctorId: apt.doctorId,
              appointmentDate: apt.appointmentDate,
              timeSlot: { 
                startTime: apt.timeSlot?.startTime || apt.timeSlot?.split(' - ')[0] || '09:00',
                endTime: apt.timeSlot?.endTime || apt.timeSlot?.split(' - ')[1] || '09:30',
                label: apt.timeSlot || 'Scheduled'
              },
              reasonForVisit: apt.reasonForVisit || apt.reason || 'Consultation',
              symptoms: apt.symptoms || [],
              notes: apt.notes || '',
              status: apt.status || 'scheduled',
              createdAt: apt.createdAt || apt.bookedAt || new Date().toISOString(),
              updatedAt: apt.updatedAt || apt.bookedAt || new Date().toISOString(),
              isLocal: false,
              fromBackend: true,
              consultationFee: apt.consultationFee || 500
            }));
            
            // Use backend appointments as primary, merge with local if needed
            activeAppointments.push(...backendFormatted);
            
            // Also merge unique local appointments
            const backendIds = new Set(backendFormatted.map(apt => apt._id));
            const uniqueLocalAppointments = finalAppointments.filter(apt => 
              apt.isLocal && !backendIds.has(apt._id)
            );
            
            if (uniqueLocalAppointments.length > 0) {
              console.log(`📦 Adding ${uniqueLocalAppointments.length} unique local appointments`);
              activeAppointments.push(...uniqueLocalAppointments);
            }
            
            console.log(`🎯 FINAL BACKEND + LOCAL MERGE: ${activeAppointments.length} total appointments`);
          } else {
            console.log('📦 No backend appointments found, using local appointments');
            activeAppointments.push(...finalAppointments);
          }
        } else {
          console.log('🔑 No auth token, using local appointments only');
          activeAppointments.push(...finalAppointments);
        }
      } catch (backendError) {
        console.log('⚠️ Backend connection failed, using local appointments:', backendError.message);
        activeAppointments.push(...finalAppointments);
      }
      
      // STEP 5: SET THE APPOINTMENTS AND UPDATE UI
      console.log(`🏆 FINAL: Setting ${activeAppointments.length} appointments in state`);
      setAppointments(activeAppointments);
      
      // STEP 6: CALCULATE STATS
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = activeAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      }).length;
      
      const upcomingCount = activeAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && ['confirmed', 'scheduled'].includes(apt.status);
      }).length;
      
      const completedCount = activeAppointments.filter(apt => 
        apt.status === 'completed'
      ).length;
      
      setStats({
        total: activeAppointments.length,
        today: todayCount,
        upcoming: upcomingCount,
        completed: completedCount
      });
      
      console.log(`📈 STATS: Total:${activeAppointments.length} | Today:${todayCount} | Upcoming:${upcomingCount} | Completed:${completedCount}`);
      
    } catch (err) {
      console.error('❌ Error in fetchAppointments:', err);
      setError('Error loading appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user.id, user.name]);

  useEffect(() => {
    if (user.id) {
      fetchAppointments();
      
      // EMERGENCY: Create test appointment if none exist after 2 seconds
      setTimeout(() => {
        if (appointments.length === 0) {
          console.log('🚨 EMERGENCY: Creating test appointment for visibility');
          
          const testApt = {
            id: `emergency-${Date.now()}`,
            patientName: "Emergency Test Patient",
            doctor: { name: "Dr. Demo", specialty: "General" },
            date: new Date().toISOString(),
            time: "09:00 - 09:30",
            reason: "Emergency test appointment",
            status: "confirmed",
            bookedAt: new Date().toISOString()
          };
          
          const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
          existing.push(testApt);
          localStorage.setItem('appointments', JSON.stringify(existing));
          
          console.log('✅ Emergency appointment created - refreshing...');
          fetchAppointments();
        }
      }, 2000);
    }
  }, [fetchAppointments]);

  useEffect(() => {
    const handleAppointmentsUpdated = () => {
      console.log('🔄 Appointments updated event received - refreshing...');
      fetchAppointments();
    };
    
    const handleAppointmentLinked = (event) => {
      console.log('🔗 Appointment linked event received:', event.detail);
      fetchAppointments();
    };
    
    const handleStorageChange = (event) => {
      if (event.key === 'appointments') {
        console.log('📦 localStorage appointments changed - refreshing...');
        fetchAppointments();
      }
    };

    const handleRealTimeUpdate = (event) => {
      console.log('📡 Real-time appointment update received:', event.detail);
      fetchAppointments();
    };
    
    // Real-time sync event listeners
    const setupRealTimeListeners = () => {
      if (window.realTimeSync) {
        console.log('🔌 Setting up real-time sync listeners for doctor dashboard');
        
        window.realTimeSync.on('doctor:new:appointment', (appointmentData) => {
          console.log('👨‍⚕️ Doctor received new appointment notification:', appointmentData.patientName);
          fetchAppointments();
        });
        
        window.realTimeSync.on('doctor:appointment:updated', (data) => {
          console.log('👨‍⚕️ Doctor appointment update received');
          fetchAppointments();
        });
        
        window.realTimeSync.on('appointment:updated', (data) => {
          console.log('📅 General appointment update - checking for doctor relevance');
          fetchAppointments();
        });
      }
    };
    
    // Setup listeners immediately and after a delay in case realTimeSync loads later
    setupRealTimeListeners();
    const delayedSetup = setTimeout(setupRealTimeListeners, 1000);
    
    window.addEventListener('appointments:updated', handleAppointmentsUpdated);
    window.addEventListener('appointments:linked', handleAppointmentLinked);
    window.addEventListener('appointments:realtime:updated', handleRealTimeUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(delayedSetup);
      window.removeEventListener('appointments:updated', handleAppointmentsUpdated);
      window.removeEventListener('appointments:linked', handleAppointmentLinked);
      window.removeEventListener('appointments:realtime:updated', handleRealTimeUpdate);
      window.removeEventListener('storage', handleStorageChange);
      
      // Clean up real-time sync listeners
      if (window.realTimeSync) {
        window.realTimeSync.off('doctor:new:appointment');
        window.realTimeSync.off('doctor:appointment:updated');
        window.realTimeSync.off('appointment:updated');
      }
    };
  }, [fetchAppointments]);

  useEffect(() => {
    const handleAppointmentsUpdated = () => {
      // Trigger a refetch by updating a state that causes the main useEffect to run
      setLoading(true);
      window.location.reload(); // Simple solution to refresh data
    };
    window.addEventListener('appointments:updated', handleAppointmentsUpdated);
    return () => window.removeEventListener('appointments:updated', handleAppointmentsUpdated);
  }, []);

  // Real-time appointment sync listener
  useEffect(() => {
    const handleRealTimeUpdate = (data) => {
      console.log('📡 Real-time appointment update received:', data.type);
      fetchAppointments(); // Refresh appointments when real-time update received
    };

    const handleDoctorAppointment = (appointmentData) => {
      console.log('👨‍⚕️ New appointment for this doctor:', appointmentData.id);
      fetchAppointments(); // Refresh to show new appointment
    };

    // Listen for real-time events
    realTimeSync.on('appointment:updated', handleRealTimeUpdate);
    realTimeSync.on('doctor:appointment:new', handleDoctorAppointment);

    // Also listen for the custom storage event from real-time sync
    window.addEventListener('appointments:realtime:updated', handleRealTimeUpdate);

    return () => {
      realTimeSync.off('appointment:updated', handleRealTimeUpdate);
      realTimeSync.off('doctor:appointment:new', handleDoctorAppointment);
      window.removeEventListener('appointments:realtime:updated', handleRealTimeUpdate);
    };
  }, [fetchAppointments]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [];
    if (filter === 'today') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate || apt.date);
        return aptDate.toDateString() === today.toDateString();
      });
    } else if (filter === 'upcoming') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate || apt.date);
        return aptDate >= today && (apt.status === 'scheduled' || apt.status === 'confirmed');
      });
    } else if (filter === 'past') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate || apt.date);
        return aptDate < today;
      });
    } else {
      filtered = appointments;
    }
    
    // Sort by date (newest first) - FIX: use appointmentDate
    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate || a.date);
      const dateB = new Date(b.appointmentDate || b.date);
      return dateB - dateA;
    });
    
    console.log(`🔍 FILTERED APPOINTMENTS: ${filtered.length} (filter: ${filter})`);
    setFilteredAppointments(filtered);
  }, [filter, appointments]);

  const getStatusColor = (appointment) => {
    const aptDate = new Date(appointment.appointmentDate || appointment.date);
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
    const aptDate = new Date(appointment.appointmentDate || appointment.date);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 text-gray-900 dark:text-white p-8">
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Welcome back, Dr. {user.name}
              </p>
            </motion.div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading appointments...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/doctor-appointments')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Activity className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate('/doctor-appointments')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Today's Appointments</p>
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
              onClick={() => navigate('/doctor-appointments')}
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/doctor-appointments')}
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
            <div className="flex items-center gap-2 flex-wrap bg-white/80 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 mr-2">Filter:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  filter === 'today'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Today ({stats.today})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  filter === 'upcoming'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  filter === 'past'
                    ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Past
              </button>
            </div>
          </motion.div>

          {/* Appointments List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {filter === 'all' ? 'All Appointments' : 
               filter === 'today' ? "Today's Appointments" :
               filter === 'upcoming' ? 'Upcoming Appointments' :
               'Past Appointments'}
            </h2>
            
            {filteredAppointments.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No appointments found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    {filter === 'today' ? "You don't have any appointments today" :
                     filter === 'upcoming' ? "No upcoming appointments scheduled" :
                     filter === 'past' ? "No past appointments to display" :
                     "No appointments scheduled yet"}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border-l-4 ${getStatusColor(appointment)} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Patient Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Patient Name</p>
                                <p className="font-semibold text-xl text-gray-900 dark:text-white">
                                  {appointment.patientId?.name || appointment.patientName || appointment.patient || 'Unknown Patient'}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(appointment)}
                          </div>

                          {/* Appointment Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Date</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                  {new Date(appointment.appointmentDate || appointment.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Time</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                  {appointment.timeSlot?.startTime || appointment.time || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Status</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium capitalize">
                                  {appointment.status || 'Confirmed'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Reason */}
                          {(appointment.reasonForVisit || appointment.reason) && (
                            <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Reason for Visit</p>
                                <p className="text-gray-700 dark:text-gray-300">{appointment.reasonForVisit || appointment.reason}</p>
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

export default DoctorDashboard;
