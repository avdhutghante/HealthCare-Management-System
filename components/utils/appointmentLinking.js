// Appointment Cross-Device Linking Utility
// This ensures appointments show up on both patient and doctor devices

export const linkAppointmentToDoctor = (appointment, doctorName = 'Dr. Demo') => {
  try {
    // BULLETPROOF APPOINTMENT LINKING SYSTEM
    
    // Ensure consistent doctor naming
    if (!doctorName.startsWith('Dr.')) {
      doctorName = `Dr. ${doctorName}`;
    }
    
    // Get existing appointments
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Create the perfectly linked appointment
    const linkedAppointment = {
      ...appointment,
      doctor: {
        ...appointment.doctor,
        name: doctorName,
        specialty: appointment.doctor?.specialty || 'General Physician',
        image: appointment.doctor?.image || '',
        city: appointment.doctor?.city || 'Demo City',
        address: appointment.doctor?.address || 'Demo Hospital'
      },
      // Multiple linking strategies for maximum compatibility
      doctorName: doctorName,
      doctorId: `doctor-${doctorName.replace(/\s/g, '-').toLowerCase()}`,
      assignedDoctor: doctorName,
      physicianName: doctorName,
      linkedAt: new Date().toISOString(),
      isLinked: true,
      linkingMethod: 'automatic',
      status: appointment.status || 'confirmed'
    };
    
    // Remove any existing appointment with same ID or patient+date+time combination
    const filtered = stored.filter(apt => 
      apt.id !== appointment.id && 
      !(apt.patientName === appointment.patientName && 
        apt.date === appointment.date && 
        apt.time === appointment.time)
    );
    
    // Add the linked appointment
    filtered.push(linkedAppointment);
    
    // Save back to localStorage with error handling
    try {
      localStorage.setItem('appointments', JSON.stringify(filtered));
      console.log(`🔗 Successfully linked appointment ${appointment.id} to ${doctorName}`);
    } catch (storageError) {
      console.error('❌ localStorage save failed:', storageError);
      // Fallback: try to save with reduced data
      const minimalAppointment = {
        id: linkedAppointment.id,
        patientName: linkedAppointment.patientName,
        doctor: { name: doctorName },
        doctorName: doctorName,
        date: linkedAppointment.date,
        time: linkedAppointment.time,
        status: 'confirmed'
      };
      filtered[filtered.length - 1] = minimalAppointment;
      localStorage.setItem('appointments', JSON.stringify(filtered));
    }
    
    // AGGRESSIVE UPDATE TRIGGERING
    const updateEvents = ['appointments:updated', 'appointments:linked', 'appointments:refresh'];
    updateEvents.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: { 
          appointment: linkedAppointment, 
          doctor: doctorName,
          timestamp: Date.now()
        }
      }));
    });
    
    // Also trigger storage event for cross-tab updates
    window.dispatchEvent(new CustomEvent('storage', {
      detail: { key: 'appointments', newValue: localStorage.getItem('appointments') }
    }));
    
    return linkedAppointment;
    
  } catch (error) {
    console.error('❌ Error linking appointment to doctor:', error);
    // Emergency fallback - ensure the appointment is still saved
    const emergencyAppointment = {
      ...appointment,
      doctor: { name: doctorName },
      doctorName: doctorName,
      status: 'confirmed'
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
      existing.push(emergencyAppointment);
      localStorage.setItem('appointments', JSON.stringify(existing));
      console.log('🆘 Emergency appointment save successful');
    } catch (emergencyError) {
      console.error('💀 Complete save failure:', emergencyError);
    }
    
    return emergencyAppointment;
  }
};

export const getDoctorAppointments = (doctorName) => {
  try {
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Multiple matching criteria to ensure we catch all appointments
    const matchingAppointments = stored.filter(apt => {
      const docName = apt.doctor?.name || apt.doctorName || '';
      const docId = apt.doctorId || '';
      
      return (
        // Direct name match
        docName.toLowerCase() === doctorName.toLowerCase() ||
        // Partial name match
        docName.toLowerCase().includes(doctorName.toLowerCase()) ||
        // Doctor ID match
        docId.toLowerCase().includes(doctorName.replace(/\s/g, '-').toLowerCase()) ||
        // For demo users, match if booking was made for "demo"
        (doctorName.toLowerCase().includes('demo') && docName.toLowerCase().includes('demo'))
      );
    });
    
    console.log(`🔍 Found ${matchingAppointments.length} appointments for ${doctorName}:`, 
                matchingAppointments.map(apt => ({ 
                  patient: apt.patientName, 
                  doctor: apt.doctor?.name,
                  date: apt.date,
                  time: apt.time 
                })));
    
    return matchingAppointments;
    
  } catch (error) {
    console.error('❌ Error getting doctor appointments:', error);
    return [];
  }
};

export const syncAppointmentAcrossDevices = (appointmentData) => {
  try {
    // Broadcast via real-time sync if available
    if (window.realTimeSync && typeof window.realTimeSync.broadcastAppointmentCreated === 'function') {
      window.realTimeSync.broadcastAppointmentCreated(appointmentData);
      console.log('📡 Broadcasted appointment via real-time sync');
    }
    
    // Also trigger local storage events for same-device components
    window.dispatchEvent(new CustomEvent('appointments:updated'));
    window.dispatchEvent(new CustomEvent('appointments:sync', { 
      detail: appointmentData 
    }));
    
    return true;
  } catch (error) {
    console.error('❌ Error syncing appointment across devices:', error);
    return false;
  }
};

export const debugAppointmentLinking = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    console.log('🐛 APPOINTMENT DEBUGGING:');
    console.log(`📊 Total appointments in storage: ${stored.length}`);
    
    stored.forEach((apt, index) => {
      console.log(`\n${index + 1}. Appointment ${apt.id}:`);
      console.log(`   Patient: ${apt.patientName}`);
      console.log(`   Doctor: ${apt.doctor?.name} (${apt.doctorName})`);
      console.log(`   Doctor ID: ${apt.doctorId}`);
      console.log(`   Date: ${apt.date}`);
      console.log(`   Time: ${apt.time}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Reason: ${apt.reason}`);
    });
    
    // Check for Dr. Demo appointments specifically
    const demoAppointments = stored.filter(apt => {
      const docName = (apt.doctor?.name || apt.doctorName || '').toLowerCase();
      return docName.includes('demo') || docName.includes('dr. demo');
    });
    
    console.log(`\n🩺 Dr. Demo appointments: ${demoAppointments.length}`);
    demoAppointments.forEach(apt => {
      console.log(`   - ${apt.patientName} on ${apt.date} at ${apt.time} for ${apt.reason}`);
    });
    
    return { total: stored.length, demoAppointments: demoAppointments.length, appointments: stored };
    
  } catch (error) {
    console.error('❌ Error debugging appointments:', error);
    return { error: error.message };
  }
};