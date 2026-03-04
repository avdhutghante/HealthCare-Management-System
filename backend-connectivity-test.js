// 🔥 BACKEND CONNECTIVITY TEST - SOLVES LOCALSTORAGE ISOLATION ISSUE
// Run this in browser console to test backend connection

console.log('🔄 Testing Backend Connectivity...');

// Test 1: Check if backend server is running
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend Health Check:', data);
    
    // Test 2: Check API endpoints
    return fetch('http://localhost:5000/api');
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Endpoints Available:', data);
    
    // Test 3: Check authentication (if user is logged in)
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Token found, testing authenticated endpoint...');
      
      return fetch('http://localhost:5000/api/appointments/doctor-appointments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log('⚠️ No authentication token found. Please log in first.');
      return null;
    }
  })
  .then(response => {
    if (response) {
      if (response.ok) {
        return response.json();
      } else {
        console.error('❌ Authentication failed:', response.status, response.statusText);
        return null;
      }
    }
    return null;
  })
  .then(data => {
    if (data) {
      console.log('✅ Backend Appointment Fetch Successful:', data);
      console.log('📊 Appointments from Backend:', data.data?.length || 0);
    }
    
    console.log('\n🎉 BACKEND TEST COMPLETE!');
    console.log('💡 If all tests passed, the localStorage isolation issue should be resolved.');
    console.log('📝 Next step: Book an appointment as patient, then login as doctor in different tab to test cross-tab sync.');
  })
  .catch(error => {
    console.error('❌ Backend Test Failed:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if backend server is running: npm run server');
    console.log('2. Verify backend is on port 5000');
    console.log('3. Check if MongoDB is connected');
    console.log('4. Ensure you are logged in as a doctor');
  });

// Test LocalStorage vs Backend comparison
console.log('\n📦 LOCALSTORAGE VS BACKEND COMPARISON:');
const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log('📦 LocalStorage Appointments:', localAppointments.length);
console.log('🔄 Backend will be tested above...');

// Display current user info
const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
console.log('👤 Current User:', userInfo.name || 'Not logged in', 'Role:', userInfo.role || 'Unknown');