import { io } from 'socket.io-client';

class RealTimeSync {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.user = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize connection
  connect(user) {
    if (this.socket && this.isConnected) {
      console.log('🔗 Already connected to real-time sync');
      return;
    }

    this.user = user;
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    console.log('🚀 Connecting to real-time sync server:', serverUrl);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventHandlers();
    this.authenticate();
    this.initializeCrossTabSync();
  }

  // Setup Socket.IO event handlers
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to real-time sync server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
      this.emit('sync:connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from real-time sync:', reason);
      this.isConnected = false;
      this.emit('sync:disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Connection error:', error);
      this.reconnectAttempts++;
      this.emit('sync:error', error);
    });

    // Appointment-related events
    this.socket.on('appointment:updated', (data) => {
      console.log('📅 Appointment update received:', data.type, data.appointment?.id);
      this.emit('appointment:updated', data);
      
      // Trigger browser storage events for components that listen to localStorage
      this.triggerStorageUpdate(data);
    });

    this.socket.on('doctor:appointment:new', (appointmentData) => {
      console.log('👨‍⚕️ New appointment for doctor:', appointmentData.id);
      this.emit('doctor:appointment:new', appointmentData);
    });

    this.socket.on('doctor:new:appointment', (appointmentData) => {
      console.log('👨‍⚕️ Doctor notification - new appointment:', appointmentData.patientName);
      this.emit('doctor:new:appointment', appointmentData);
      
      // Trigger storage update for doctor dashboard
      this.triggerStorageUpdate({
        type: 'new_appointment_for_doctor',
        appointment: appointmentData
      });
    });

    this.socket.on('doctor:appointment:updated', (data) => {
      console.log('👨‍⚕️ Doctor appointment updated:', data.doctorName);
      this.emit('doctor:appointment:updated', data);
      
      // Trigger storage update
      this.triggerStorageUpdate({
        type: 'doctor_appointment_updated',
        appointment: data.appointment
      });
    });
  }

  // Authenticate with server
  authenticate() {
    if (this.socket && this.user) {
      console.log('🔐 Authenticating user:', this.user.name);
      this.socket.emit('authenticate', {
        id: this.user.id,
        role: this.user.role,
        name: this.user.name,
        email: this.user.email
      });
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log('👋 Disconnecting from real-time sync');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.user = null;
    }
  }

  // Send appointment creation event
  broadcastAppointmentCreated(appointment) {
    if (this.socket && this.isConnected) {
      console.log('📤 Broadcasting appointment creation:', appointment.id);
      this.socket.emit('appointment:created', appointment);
      
      // Special notification for doctors
      if (appointment.doctor && appointment.doctor.name) {
        console.log('👨‍⚕️ Notifying doctor about new appointment:', appointment.doctor.name);
        this.socket.emit('doctor:new:appointment', {
          doctorName: appointment.doctor.name,
          patientName: appointment.patientName,
          appointmentDate: appointment.date,
          timeSlot: appointment.time,
          reason: appointment.reason,
          appointmentId: appointment.id
        });
      }
    }
  }

  // Send appointment update for doctors
  broadcastAppointmentUpdate(appointment) {
    if (this.socket && this.isConnected) {
      console.log('📤 Broadcasting appointment update:', appointment.id);
      this.socket.emit('appointment:updated', {
        type: 'updated',
        appointment: appointment
      });
      
      // Specific doctor notification
      if (appointment.doctor && appointment.doctor.name) {
        this.socket.emit('doctor:appointment:updated', {
          doctorName: appointment.doctor.name,
          appointment: appointment
        });
      }
    }
  }

  // Send appointment cancellation event
  broadcastAppointmentCancelled(appointment) {
    if (this.socket && this.isConnected) {
      console.log('📤 Broadcasting appointment cancellation:', appointment.id);
      this.socket.emit('appointment:cancelled', appointment);
    }
  }

  // Send appointment reschedule event
  broadcastAppointmentRescheduled(appointment) {
    if (this.socket && this.isConnected) {
      console.log('📤 Broadcasting appointment reschedule:', appointment.id);
      this.socket.emit('appointment:rescheduled', appointment);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Trigger localStorage change events for compatibility
  triggerStorageUpdate(data) {
    // Create a custom storage event to notify components
    const storageEvent = new CustomEvent('appointments:realtime:updated', {
      detail: data
    });
    window.dispatchEvent(storageEvent);
    
    // Also trigger the existing appointments:updated event
    window.dispatchEvent(new CustomEvent('appointments:updated'));
    
    // Force cross-tab sync
    this.syncAppointmentsAcrossTabs();
  }

  // Sync appointments across tabs using multiple methods
  syncAppointmentsAcrossTabs() {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      // Method 1: Use sessionStorage as additional sync point
      sessionStorage.setItem('appointments_sync', JSON.stringify({
        appointments,
        timestamp: Date.now(),
        source: 'realTimeSync'
      }));
      
      // Method 2: Use IndexedDB for persistent cross-tab storage
      this.storeInIndexedDB(appointments);
      
      // Method 3: Broadcast to all tabs via BroadcastChannel
      if (typeof BroadcastChannel !== 'undefined') {
        if (!this.broadcastChannel) {
          this.broadcastChannel = new BroadcastChannel('healthcare_appointments');
        }
        this.broadcastChannel.postMessage({
          type: 'appointments_updated',
          appointments,
          timestamp: Date.now()
        });
      }
      
      console.log('🔄 Cross-tab sync completed for', appointments.length, 'appointments');
    } catch (error) {
      console.error('❌ Cross-tab sync failed:', error);
    }
  }

  // Store appointments in IndexedDB for persistent cross-tab access
  async storeInIndexedDB(appointments) {
    try {
      // Simple IndexedDB implementation
      const dbName = 'HealthcareDB';
      const dbVersion = 1;
      
      const request = indexedDB.open(dbName, dbVersion);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['appointments'], 'readwrite');
        const store = transaction.objectStore('appointments');
        
        // Clear existing and add new appointments
        store.clear().onsuccess = () => {
          appointments.forEach(appointment => {
            store.add({
              ...appointment,
              syncedAt: new Date().toISOString()
            });
          });
        };
        
        console.log('💾 Appointments stored in IndexedDB');
      };
    } catch (error) {
      console.log('ℹ️ IndexedDB not available:', error.message);
    }
  }

  // Load appointments from IndexedDB
  async loadFromIndexedDB() {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('HealthcareDB', 1);
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['appointments'], 'readonly');
          const store = transaction.objectStore('appointments');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const appointments = getAllRequest.result || [];
            console.log('📥 Loaded', appointments.length, 'appointments from IndexedDB');
            resolve(appointments);
          };
        };
        
        request.onerror = () => {
          console.log('ℹ️ Could not load from IndexedDB');
          resolve([]);
        };
      } catch (error) {
        console.log('ℹ️ IndexedDB not available');
        resolve([]);
      }
    });
  }

  // Initialize cross-tab sync listeners
  initializeCrossTabSync() {
    // Listen for BroadcastChannel messages
    if (typeof BroadcastChannel !== 'undefined') {
      if (!this.broadcastChannel) {
        this.broadcastChannel = new BroadcastChannel('healthcare_appointments');
      }
      
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'appointments_updated') {
          console.log('📡 Received cross-tab appointment update:', event.data.appointments.length);
          
          // Update local storage with received appointments
          localStorage.setItem('appointments', JSON.stringify(event.data.appointments));
          
          // Trigger update events
          this.emit('appointment:updated', {
            type: 'cross_tab_sync',
            appointments: event.data.appointments
          });
          
          window.dispatchEvent(new CustomEvent('appointments:updated'));
        }
      };
    }
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'appointments' && event.newValue) {
        console.log('📦 Storage event from another tab detected');
        this.emit('appointment:updated', {
          type: 'storage_sync',
          appointments: JSON.parse(event.newValue)
        });
      }
    });
    
    console.log('🔗 Cross-tab sync listeners initialized');
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      user: this.user?.name || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Force reconnection
  reconnect() {
    if (this.socket) {
      console.log('🔄 Force reconnecting...');
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

// Create singleton instance
const realTimeSync = new RealTimeSync();

// Merge appointments from multiple sources
const mergeAppointmentsFromAllSources = async () => {
  const sources = [];
  
  // Source 1: localStorage
  const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  sources.push({ source: 'localStorage', appointments: localAppointments });
  
  // Source 2: sessionStorage sync
  const sessionSync = sessionStorage.getItem('appointments_sync');
  if (sessionSync) {
    const sessionData = JSON.parse(sessionSync);
    sources.push({ source: 'sessionStorage', appointments: sessionData.appointments || [] });
  }
  
  // Source 3: IndexedDB
  if (realTimeSync) {
    const idbAppointments = await realTimeSync.loadFromIndexedDB();
    sources.push({ source: 'indexedDB', appointments: idbAppointments });
  }
  
  // Merge all sources, removing duplicates
  const allAppointments = [];
  const seenIds = new Set();
  
  sources.forEach(({ source, appointments }) => {
    console.log(`📥 Merging ${appointments.length} appointments from ${source}`);
    
    appointments.forEach(apt => {
      const id = apt.id || apt._id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allAppointments.push(apt);
      }
    });
  });
  
  // Update localStorage with merged appointments
  if (allAppointments.length > 0) {
    localStorage.setItem('appointments', JSON.stringify(allAppointments));
    console.log(`🔄 Merged ${allAppointments.length} unique appointments from all sources`);
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('appointments:updated'));
  }
  
  return allAppointments;
};

// Auto-connect when user is available
const initializeRealTimeSync = async () => {
  const storedUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');
  
  if (storedUser && token) {
    try {
      const user = JSON.parse(storedUser);
      realTimeSync.connect(user);
      
      // Merge appointments from all sources after connecting
      setTimeout(async () => {
        await mergeAppointmentsFromAllSources();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error parsing stored user for real-time sync:', error);
    }
  } else {
    // Even without user, try to merge appointments
    setTimeout(async () => {
      await mergeAppointmentsFromAllSources();
    }, 500);
  }
};

// Expose merge function globally
window.mergeAppointmentsFromAllSources = mergeAppointmentsFromAllSources;

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Make realTimeSync globally available for debugging
  window.realTimeSync = realTimeSync;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRealTimeSync);
  } else {
    initializeRealTimeSync();
  }
  
  // Listen for authentication changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser' || e.key === 'token') {
      if (e.newValue) {
        initializeRealTimeSync();
      } else {
        realTimeSync.disconnect();
      }
    }
  });
  
  console.log('Appointments:', JSON.parse(localStorage.getItem('appointments') || '[]'));
  console.log('Current User:', JSON.parse(localStorage.getItem('currentUser')));
}

export default realTimeSync;