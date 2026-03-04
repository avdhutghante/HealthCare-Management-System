// Debug script for Doctor Dashboard - paste this in browser console
console.log('🔍 DOCTOR DASHBOARD DEBUG SCRIPT');
console.log('================================');

// Step 1: Check current user
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('👤 Current User:', currentUser);

// Step 2: Check all appointments in localStorage
const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log(`📦 Total appointments in localStorage: ${allAppointments.length}`);

if (allAppointments.length > 0) {
  console.log('📋 All appointments:');
  allAppointments.forEach((apt, index) => {
    console.log(`  ${index + 1}. Patient: ${apt.patientName || 'Unknown'}`);
    console.log(`     Doctor: ${apt.doctor?.name || 'No doctor name'}`);
    console.log(`     Date: ${apt.date || 'No date'}`);
    console.log(`     Time: ${apt.time || 'No time'}`);
    console.log(`     Status: ${apt.status || 'No status'}`);
    console.log(`     ---`);
  });
} else {
  console.log('❌ No appointments found in localStorage');
}

// Step 3: Check doctor name variations
const doctorName = currentUser.name || 'Dr. Demo';
const doctorVariations = [
  doctorName,
  doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,
  doctorName.startsWith('Dr.') ? doctorName.replace('Dr. ', '') : doctorName,
  'Dr. Demo',
  'Demo',
  'demo'
];
console.log('🔍 Doctor name variations being searched:', doctorVariations);

// Step 4: Test matching logic
const matchingAppointments = allAppointments.filter(apt => {
  if (!apt.doctor?.name) return false;
  
  const aptDoctorName = apt.doctor.name.toLowerCase().trim();
  const matchesDoctor = doctorVariations.some(variation => {
    const varLower = variation.toLowerCase().trim();
    return aptDoctorName === varLower || 
           aptDoctorName.includes(varLower) || 
           varLower.includes(aptDoctorName) ||
           (varLower.includes('demo') && aptDoctorName.includes('demo'));
  });
  
  if (matchesDoctor) {
    console.log(`✅ MATCH FOUND: ${apt.patientName} -> ${apt.doctor.name}`);
  } else {
    console.log(`❌ NO MATCH: ${apt.patientName} -> ${apt.doctor.name} (doesn't match any variation)`);
  }
  
  return matchesDoctor;
});

console.log(`🎯 MATCHING APPOINTMENTS: ${matchingAppointments.length}`);

// Step 5: Check real-time sync status
if (window.realTimeSync) {
  console.log('🔗 Real-time sync status:', window.realTimeSync.getStatus());
} else {
  console.log('❌ Real-time sync not available');
}

// Step 6: Suggest fixes
console.log('🔧 POTENTIAL FIXES:');
if (allAppointments.length === 0) {
  console.log('1. Book a new appointment first');
}
if (matchingAppointments.length === 0 && allAppointments.length > 0) {
  console.log('2. Doctor name mismatch - check appointment doctor names vs current user name');
}
console.log('3. Try refreshing the page');
console.log('4. Check browser console for errors');

console.log('================================');
console.log('📋 Copy and paste this script in the browser console on the Doctor Dashboard page');