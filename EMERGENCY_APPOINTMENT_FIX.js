// Emergency Appointment Visibility Fix - Run this in browser console

console.log('🔧 EMERGENCY APPOINTMENT VISIBILITY DIAGNOSTIC');
console.log('==============================================');

// Step 1: Check current user
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('👤 Current User:', currentUser);

// Step 2: Check appointments
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log('📦 Total appointments in localStorage:', appointments.length);

if (appointments.length === 0) {
  console.log('❌ NO APPOINTMENTS FOUND - Creating test appointment...');
  
  // Create a test appointment that will definitely match
  const testAppointment = {
    id: `emergency-fix-${Date.now()}`,
    patientName: "Emergency Test Patient",
    doctor: {
      name: "Dr. Demo",  // This should match
      specialty: "General Physician"
    },
    date: new Date().toISOString(),
    time: "09:00 - 09:30",
    reason: "Emergency test appointment",
    status: "confirmed",
    bookedAt: new Date().toISOString(),
    isMock: true
  };
  
  // Add to localStorage
  appointments.push(testAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  console.log('✅ Emergency test appointment created');
  console.log('🔄 Reloading page...');
  
  // Force page reload
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
} else {
  console.log('📋 Existing appointments:');
  appointments.forEach((apt, index) => {
    console.log(`${index + 1}. Patient: ${apt.patientName}`);
    console.log(`   Doctor: "${apt.doctor?.name}" (exact string)`);
    console.log(`   Date: ${apt.date}`);
    console.log(`   Status: ${apt.status}`);
    console.log('   ---');
  });
  
  // Check doctor matching
  const doctorName = currentUser.name || 'Dr. Demo';
  console.log('🔍 Current doctor name to match:', `"${doctorName}"`);
  
  appointments.forEach(apt => {
    if (apt.doctor?.name) {
      const aptDoctorName = apt.doctor.name.toLowerCase().trim();
      const userDoctorName = doctorName.toLowerCase().trim();
      
      console.log(`Comparing: "${aptDoctorName}" vs "${userDoctorName}"`);
      
      if (aptDoctorName.includes('demo') || userDoctorName.includes('demo')) {
        console.log('✅ DEMO MATCH FOUND - This appointment should be visible');
      } else {
        console.log('❌ No demo match');
      }
    }
  });
  
  console.log('🔄 Triggering manual refresh...');
  window.dispatchEvent(new CustomEvent('appointments:updated'));
}

console.log('==============================================');