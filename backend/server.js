import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import labRoutes from './routes/lab.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import labTestRoutes from './routes/labTest.routes.js';
import adminRoutes from './routes/admin.routes.js';
import aiRoutes from './routes/ai.routes.js';
import heartDiseaseRoutes from './routes/heartDisease.routes.js';

// ES Module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// ---------------------------------------------
// Middleware
// ---------------------------------------------
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------
// Health Check Route
// ---------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ---------------------------------------------
// API Routes
// ---------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/heart-disease', heartDiseaseRoutes);

// API Info Endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🏥 Healthcare Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      labs: '/api/labs',
      appointments: '/api/appointments',
      labTests: '/api/lab-tests',
      admin: '/api/admin',
    },
    documentation: 'See README.md for complete API documentation',
    testingDashboard: 'Visit http://localhost:5000 for interactive testing',
  });
});

// ---------------------------------------------
// Error Handling Middleware
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------------------------------
// Database Connection (MongoDB Atlas)
// ---------------------------------------------
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGODB_URI in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  // These options are optional in Mongoose v7+
  serverSelectionTimeoutMS: 10000, // fail faster if unreachable
})
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully');

    // Socket.IO Connection Handling
    const connectedUsers = new Map();
    
    io.on('connection', (socket) => {
      console.log('👤 User connected:', socket.id);
      
      // Handle user authentication and join rooms
      socket.on('authenticate', (userData) => {
        if (userData && userData.id) {
          socket.userId = userData.id;
          socket.userRole = userData.role;
          connectedUsers.set(userData.id, {
            socketId: socket.id,
            role: userData.role,
            name: userData.name
          });
          
          // Join role-based rooms
          socket.join(`role:${userData.role}`);
          if (userData.role === 'doctor') {
            socket.join(`doctor:${userData.id}`);
          }
          
          console.log(`✅ User authenticated: ${userData.name} (${userData.role})`);
        }
      });
      
      // Handle appointment updates
      socket.on('appointment:created', (appointmentData) => {
        console.log('📅 Broadcasting appointment creation:', appointmentData.id);
        
        // Broadcast to all connected devices
        socket.broadcast.emit('appointment:updated', {
          type: 'created',
          appointment: appointmentData
        });
        
        // Broadcast to specific doctor if available
        if (appointmentData.doctorId) {
          socket.broadcast.to(`doctor:${appointmentData.doctorId}`).emit('doctor:appointment:new', appointmentData);
        }
      });

      // Handle doctor-specific appointment notifications
      socket.on('doctor:new:appointment', (appointmentData) => {
        console.log('👨‍⚕️ Broadcasting new appointment to doctors:', appointmentData.doctorName);
        
        // Broadcast to all doctors
        socket.broadcast.to('role:doctor').emit('doctor:new:appointment', appointmentData);
        
        // Also broadcast general update
        socket.broadcast.emit('appointment:updated', {
          type: 'new_for_doctor',
          appointment: appointmentData
        });
      });

      socket.on('doctor:appointment:updated', (data) => {
        console.log('👨‍⚕️ Broadcasting doctor appointment update:', data.doctorName);
        
        // Broadcast to all doctors
        socket.broadcast.to('role:doctor').emit('doctor:appointment:updated', data);
        
        // Also broadcast general update
        socket.broadcast.emit('appointment:updated', {
          type: 'doctor_appointment_updated',
          appointment: data.appointment
        });
      });
      
      socket.on('appointment:cancelled', (appointmentData) => {
        console.log('❌ Broadcasting appointment cancellation:', appointmentData.id);
        socket.broadcast.emit('appointment:updated', {
          type: 'cancelled',
          appointment: appointmentData
        });
      });
      
      socket.on('appointment:rescheduled', (appointmentData) => {
        console.log('📅 Broadcasting appointment reschedule:', appointmentData.id);
        socket.broadcast.emit('appointment:updated', {
          type: 'rescheduled',
          appointment: appointmentData
        });
      });
      
      socket.on('disconnect', () => {
        if (socket.userId) {
          connectedUsers.delete(socket.userId);
          console.log('👋 User disconnected:', socket.userId);
        }
      });
    });
    
    // Make connected users available to routes
    app.set('connectedUsers', connectedUsers);

    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 WebSocket Server: ws://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

export default app;
