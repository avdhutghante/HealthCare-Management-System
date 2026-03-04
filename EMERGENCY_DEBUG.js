/**
 * EMERGENCY APPOINTMENT DEBUG SCRIPT
 * Paste this into browser console on Doctor Dashboard
 */

console.log('🔧 EMERGENCY APPOINTMENT DEBUG STARTED');
console.log('====================================');

// Step 1: Check current appointments in state
console.log('\n📊 STEP 1: Current Appointments');
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log(`Found ${appointments.length} appointments in localStorage`);
console.log('Appointments:', appointments);

// Step 2: Force create test appointments
console.log('\n🧪 STEP 2: Creating Test Appointments');
const testAppointments = [
  {
    id: `test-${Date.now()}-1`,
    patientName: 'Emergency Patient 1',
    doctor: {
      name: 'Dr. Demo',
      specialty: 'General Physician'
    },
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: 'Emergency test appointment',
    status: 'confirmed'
  },
  {
    id: `test-${Date.now()}-2`,
    patientName: 'Emergency Patient 2',
    doctor: {
      name: 'Dr. Demo',
      specialty: 'Cardiologist'
    },
    date: new Date().toISOString().split('T')[0],
    time: '2:00 PM',
    reason: 'Follow-up consultation',
    status: 'confirmed'
  },
  {
    id: `test-${Date.now()}-3`,
    patientName: 'Emergency Patient 3',
    doctor: {
      name: 'Demo DOCTOR',
      specialty: 'Pediatrician'
    },
    date: new Date().toISOString().split('T')[0],
    time: '4:00 PM',
    reason: 'Routine checkup',
    status: 'scheduled'
  }
];

// Save to localStorage
const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
const updated = [...existing, ...testAppointments];
localStorage.setItem('appointments', JSON.stringify(updated));

console.log(`✅ Created ${testAppointments.length} test appointments`);
console.log(`📦 Total appointments in localStorage: ${updated.length}`);

// Step 3: Test backend connection
console.log('\n🌐 STEP 3: Testing Backend Connection');
fetch('http://localhost:5000/api/appointments/doctor-appointments', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend Response:', data);
    console.log(`Backend has ${data.data?.length || 0} appointments`);
  })
  .catch(e => {
    console.log('❌ Backend Error:', e.message);
  });

// Step 4: Trigger page refresh
console.log('\n🔄 STEP 4: Instructions');
console.log('1. You should now have 3 test appointments in localStorage');
console.log('2. Click "🔄 Refresh All Sources" button');
console.log('3. Or click "🔧 FORCE SHOW APPOINTMENTS" for immediate display');
console.log('4. Or reload the page (F5)');
console.log('\n====================================');
console.log('✅ DEBUG SCRIPT COMPLETED');
console.log('Now click one of the debug buttons on the dashboard!');
