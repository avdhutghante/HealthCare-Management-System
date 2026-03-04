// Demo data synchronization helper
// This helps sync mock appointments to work with the cross-device system

export const syncDemoAppointments = async () => {
  try {
    console.log('🔄 Starting demo appointments sync...');
    
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    if (!storedUser.id || storedUser.role !== 'doctor') {
      console.log('👤 Not a doctor user, skipping demo sync');
      return;
    }
    
    // Find appointments for this doctor in localStorage
    const doctorName = storedUser.name || '';
    const doctorAppointments = storedAppointments.filter(apt => {
      const aptDoctorName = apt.doctor?.name || '';
      return aptDoctorName.toLowerCase().includes(doctorName.toLowerCase());
    });
    
    if (doctorAppointments.length === 0) {
      console.log('📅 No demo appointments to sync for', doctorName);
      return;
    }
    
    console.log(`📊 Found ${doctorAppointments.length} demo appointments for ${doctorName}`);
    
    // For demo purposes, we'll create a simple mapping system
    // In a real system, you'd want to ensure the doctor exists in the backend first
    
    // Mark appointments as synced to avoid re-processing
    const updatedAppointments = storedAppointments.map(apt => {
      if (doctorAppointments.includes(apt)) {
        return { ...apt, isDemoSynced: true };
      }
      return apt;
    });
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    console.log('✅ Demo appointments marked as synced');
    
    return {
      success: true,
      doctorName,
      appointmentCount: doctorAppointments.length,
      message: `Synced ${doctorAppointments.length} demo appointments for ${doctorName}`
    };
    
  } catch (error) {
    console.error('❌ Demo sync failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getDemoAppointmentsForDoctor = (doctorName) => {
  try {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    console.log('🔍 All stored appointments:', storedAppointments.length);
    
    console.log(`👨‍⚕️ Searching for appointments for doctor: "${doctorName}"`);
    
    const doctorAppointments = storedAppointments.filter(apt => {
      const aptDoctorName = apt.doctor?.name || '';
      const normalizedAptName = aptDoctorName.toLowerCase().trim();
      const normalizedDoctorName = doctorName.toLowerCase().trim();
      
      // Enhanced matching logic
      const exactMatch = normalizedAptName === normalizedDoctorName;
      const includesMatch = normalizedAptName.includes(normalizedDoctorName);
      const reverseIncludesMatch = normalizedDoctorName.includes(normalizedAptName);
      const demoMatch = normalizedDoctorName.includes('demo') && normalizedAptName.includes('demo');
      
      const matches = exactMatch || includesMatch || reverseIncludesMatch || demoMatch;
      const notCancelled = (apt.status || '').toLowerCase() !== 'cancelled';
      
      console.log(`📋 Checking: "${apt.patientName}" -> Doctor: "${aptDoctorName}" | Target: "${doctorName}" | Match: ${matches} | Active: ${notCancelled}`);
      
      return matches && notCancelled;
    });
    
    console.log(`📅 Found ${doctorAppointments.length} appointments for Dr. ${doctorName}`);
    
    // Convert to backend-compatible format
    return doctorAppointments.map(apt => ({
      _id: apt.id || `demo-${Date.now()}-${Math.random()}`,
      patientId: { 
        name: apt.patientName || 'Patient',
        _id: `patient-${apt.patientName?.replace(/\s/g, '-').toLowerCase()}`
      },
      doctorId: `doctor-${doctorName.replace(/\s/g, '-').toLowerCase()}`,
      appointmentDate: apt.date,
      timeSlot: { 
        startTime: apt.time?.split(' - ')[0] || '09:00',
        endTime: apt.time?.split(' - ')[1] || '09:30',
        label: apt.time || 'Morning slot'
      },
      reasonForVisit: apt.reason || 'General consultation',
      symptoms: [],
      notes: apt.notes || '',
      status: apt.status || 'scheduled',
      createdAt: apt.bookedAt || new Date().toISOString(),
      updatedAt: apt.bookedAt || new Date().toISOString(),
      isDemo: true,
      consultationFee: 500 // default demo fee
    }));
  } catch (error) {
    console.error('❌ Error getting demo appointments:', error);
    return [];
  }
};

export const createDemoAppointment = (appointmentData, doctorName, patientName) => {
  try {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    const newAppointment = {
      id: `demo-${Date.now()}-${Math.random()}`,
      doctor: {
        name: doctorName,
        specialty: 'General Physician',
        image: '',
        city: 'Demo City',
        address: 'Demo Hospital'
      },
      patientName: patientName,
      date: appointmentData.date,
      time: appointmentData.time,
      reason: appointmentData.reason || 'General consultation',
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      isDemo: true
    };
    
    storedAppointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(storedAppointments));
    
    console.log('✅ Created demo appointment:', newAppointment);
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('appointments:updated'));
    
    return newAppointment;
  } catch (error) {
    console.error('❌ Error creating demo appointment:', error);
    return null;
  }
};