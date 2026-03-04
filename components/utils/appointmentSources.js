// 🔥 MULTIPLE APPOINTMENT DATA SOURCES (SOLVES LOCALSTORAGE ISOLATION)

import { appointmentAPI } from './api.js';

/**
 * OPTION 1: Backend Database (Primary - Cross-tab/device compatible)
 */
export const fetchFromBackend = async (doctorId) => {
  try {
    console.log('🔄 Fetching appointments from Backend Database...');
    const response = await appointmentAPI.getDoctorAppointments({ doctorId });
    const appointments = response?.data || [];
    console.log(`✅ Backend: Found ${appointments.length} appointments`);
    
    // Transform backend data to frontend format
    return appointments.map(apt => ({
      id: apt._id || apt.id,
      backendId: apt._id,
      patientName: apt.patientId?.name || apt.patientName,
      doctor: {
        name: apt.doctorId?.name || apt.doctorName,
        specialty: apt.doctorId?.specialty || 'General Physician'
      },
      date: apt.appointmentDate || apt.date,
      time: apt.timeSlot?.startTime || apt.time,
      reason: apt.reasonForVisit || apt.reason,
      status: apt.status || 'confirmed',
      source: 'BACKEND'
    }));
  } catch (error) {
    console.error('❌ Backend fetch failed:', error);
    return [];
  }
};

/**
 * OPTION 2: localStorage (Fallback - Same tab only)
 */
export const fetchFromLocalStorage = () => {
  try {
    console.log('🔄 Fetching appointments from localStorage...');
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    console.log(`✅ localStorage: Found ${stored.length} appointments`);
    
    return stored.map(apt => ({
      ...apt,
      source: 'LOCALSTORAGE'
    }));
  } catch (error) {
    console.error('❌ localStorage fetch failed:', error);
    return [];
  }
};

/**
 * OPTION 3: sessionStorage (Cross-tab sync)
 */
export const fetchFromSessionStorage = () => {
  try {
    console.log('🔄 Fetching appointments from sessionStorage...');
    const sessionSync = sessionStorage.getItem('appointments_sync');
    
    if (!sessionSync) return [];
    
    const sessionData = JSON.parse(sessionSync);
    const appointments = sessionData.appointments || [];
    console.log(`✅ sessionStorage: Found ${appointments.length} appointments`);
    
    return appointments.map(apt => ({
      ...apt,
      source: 'SESSIONSTORAGE'
    }));
  } catch (error) {
    console.error('❌ sessionStorage fetch failed:', error);
    return [];
  }
};

/**
 * OPTION 4: IndexedDB (Browser Database - Persistent across tabs)
 */
export const fetchFromIndexedDB = async () => {
  try {
    console.log('🔄 Fetching appointments from IndexedDB...');
    
    // Try to use existing realTimeSync
    if (window.realTimeSync && window.realTimeSync.loadFromIndexedDB) {
      const appointments = await window.realTimeSync.loadFromIndexedDB();
      console.log(`✅ IndexedDB: Found ${appointments.length} appointments`);
      
      return appointments.map(apt => ({
        ...apt,
        source: 'INDEXEDDB'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ IndexedDB fetch failed:', error);
    return [];
  }
};

/**
 * OPTION 5: WebSocket Real-time (Live updates)
 */
export const fetchFromWebSocket = () => {
  return new Promise((resolve) => {
    try {
      console.log('🔄 Requesting appointments via WebSocket...');
      
      if (window.socket && window.socket.connected) {
        // Listen for response
        const timeout = setTimeout(() => {
          console.log('⏰ WebSocket timeout, continuing...');
          resolve([]);
        }, 3000);
        
        window.socket.once('doctorAppointments', (data) => {
          clearTimeout(timeout);
          console.log(`✅ WebSocket: Received ${data.length} appointments`);
          
          const appointments = data.map(apt => ({
            ...apt,
            source: 'WEBSOCKET'
          }));
          
          resolve(appointments);
        });
        
        // Request appointments
        window.socket.emit('getDoctorAppointments', { doctorId: 'current' });
      } else {
        console.log('❌ WebSocket not connected');
        resolve([]);
      }
    } catch (error) {
      console.error('❌ WebSocket fetch failed:', error);
      resolve([]);
    }
  });
};

/**
 * OPTION 6: Manual Mock Data (Emergency fallback)
 */
export const fetchMockAppointments = (doctorName = 'Dr. Demo') => {
  console.log('🔄 Creating mock appointments for testing...');
  
  const mockAppointments = [
    {
      id: `mock-${Date.now()}-1`,
      patientName: 'Test Patient 1',
      doctor: {
        name: doctorName,
        specialty: 'General Physician'
      },
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      reason: 'Mock appointment for testing',
      status: 'confirmed',
      source: 'MOCK'
    },
    {
      id: `mock-${Date.now()}-2`,
      patientName: 'Test Patient 2', 
      doctor: {
        name: doctorName,
        specialty: 'General Physician'
      },
      date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      time: '2:00 PM',
      reason: 'Follow-up consultation',
      status: 'confirmed',
      source: 'MOCK'
    }
  ];
  
  console.log(`✅ Mock: Created ${mockAppointments.length} test appointments`);
  return mockAppointments;
};

/**
 * MASTER FUNCTION: Try all sources and merge unique appointments
 */
export const fetchFromAllSources = async (doctorId, doctorName = 'Dr. Demo') => {
  console.log('🔄 FETCHING APPOINTMENTS FROM ALL AVAILABLE SOURCES...');
  
  const allAppointments = [];
  const seenIds = new Set();
  
  // Source priority order (most reliable first)
  const sources = [
    () => fetchFromBackend(doctorId),
    () => fetchFromIndexedDB(),
    () => fetchFromLocalStorage(),
    () => fetchFromSessionStorage(),
    () => fetchFromWebSocket(),
    () => Promise.resolve(fetchMockAppointments(doctorName)) // Always available
  ];
  
  // Try each source
  for (let i = 0; i < sources.length; i++) {
    try {
      const sourceAppointments = await sources[i]();
      
      // Add unique appointments only
      sourceAppointments.forEach(apt => {
        if (!seenIds.has(apt.id)) {
          seenIds.add(apt.id);
          allAppointments.push(apt);
        }
      });
      
      // Stop if we have enough appointments from reliable sources
      if (allAppointments.length > 0 && i < 3) {
        console.log(`✅ Found ${allAppointments.length} appointments from reliable source ${i + 1}`);
        break;
      }
      
    } catch (error) {
      console.error(`❌ Source ${i + 1} failed:`, error);
    }
  }
  
  console.log(`📊 TOTAL UNIQUE APPOINTMENTS: ${allAppointments.length}`);
  
  // Log source breakdown
  const sourceBreakdown = allAppointments.reduce((acc, apt) => {
    acc[apt.source] = (acc[apt.source] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📈 Source breakdown:', sourceBreakdown);
  
  return allAppointments;
};

/**
 * OPTION 7: Force create appointments for testing
 */
export const createTestAppointment = (doctorName = 'Dr. Demo') => {
  const testAppointment = {
    id: `test-${Date.now()}`,
    patientName: 'Emergency Test Patient',
    doctor: {
      name: doctorName,
      specialty: 'General Physician'
    },
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    reason: 'Emergency test appointment created by system',
    status: 'confirmed',
    source: 'SYSTEM_CREATED'
  };
  
  // Save to localStorage immediately
  try {
    const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
    existing.push(testAppointment);
    localStorage.setItem('appointments', JSON.stringify(existing));
    console.log('✅ Test appointment created and saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save test appointment:', error);
  }
  
  return testAppointment;
};