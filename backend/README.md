# Healthcare Management System - Backend

A comprehensive backend system for managing healthcare services including patient appointments, doctor management, lab tests, and admin panel.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 👥 **User Management** - Support for Patients, Doctors, Labs, and Admins
- ✅ **Admin Approval System** - Doctors and Labs require admin approval before activation
- 📅 **Appointment Management** - Book, manage, and track appointments
- 🧪 **Lab Test Management** - Book lab tests, track results, and manage reports
- 📊 **Dashboard Statistics** - Admin dashboard with comprehensive analytics
- 🔍 **Search & Filters** - Advanced search and filtering capabilities
- ⭐ **Review System** - Patients can review doctors and labs

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Password Hashing**: Bcrypt.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/healthcare-db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@healthcare.com
   ADMIN_PASSWORD=Admin@123
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   # Make sure MongoDB is running
   # On Windows, it usually runs as a service
   ```
   
   Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env

5. **Seed the admin user**
   ```bash
   npm run seed
   ```

6. **Start the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-password` - Update password

### Admin Panel
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with filters
- `GET /api/admin/pending-approvals` - Get pending doctor/lab approvals
- `PUT /api/admin/approve/:userId` - Approve doctor/lab
- `PUT /api/admin/reject/:userId` - Reject doctor/lab
- `PUT /api/admin/deactivate/:userId` - Deactivate user account
- `PUT /api/admin/activate/:userId` - Activate user account

### Doctors
- `GET /api/doctors` - Get all approved doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/profile` - Update doctor profile (Doctor only)
- `POST /api/doctors/:id/review` - Add review to doctor (Patient only)

### Labs
- `GET /api/labs` - Get all approved labs
- `GET /api/labs/:id` - Get lab by ID
- `PUT /api/labs/profile` - Update lab profile (Lab only)
- `POST /api/labs/:id/review` - Add review to lab (Patient only)

### Appointments
- `POST /api/appointments` - Create appointment (Patient only)
- `GET /api/appointments/my-appointments` - Get patient's appointments
- `GET /api/appointments/doctor-appointments` - Get doctor's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status (Doctor only)
- `PUT /api/appointments/:id/complete` - Complete appointment with diagnosis (Doctor only)
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Lab Tests
- `POST /api/lab-tests` - Create lab test booking (Patient only)
- `GET /api/lab-tests/my-tests` - Get patient's lab tests
- `GET /api/lab-tests/lab-bookings` - Get lab's bookings
- `GET /api/lab-tests/:id` - Get lab test by ID
- `PUT /api/lab-tests/:id/status` - Update lab test status (Lab only)
- `PUT /api/lab-tests/:id/results` - Add test results (Lab only)
- `PUT /api/lab-tests/:id/cancel` - Cancel lab test

## User Roles

### Patient
- Can book appointments with doctors
- Can book lab tests
- Can view their appointment and test history
- Can review doctors and labs
- Auto-approved upon registration

### Doctor
- Requires admin approval
- Can view and manage their appointments
- Can add diagnosis and prescriptions
- Can update their profile
- Receives patient reviews

### Lab
- Requires admin approval
- Can view and manage test bookings
- Can update test status and add results
- Can update their profile and services
- Receives patient reviews

### Admin
- Can approve/reject doctors and labs
- Can view all users and activities
- Can deactivate/activate accounts
- Access to dashboard statistics
- Full system control

## Database Models

### User
Base model for all users (patients, doctors, labs, admin)
- name, email, password, phone, role
- address, profileImage
- isActive, isApproved, approvedBy, approvedAt

### Doctor
Extended profile for doctors
- userId (reference to User)
- specialty, qualifications, experience
- licenseNumber, hospitalAffiliation
- consultationFee, availableTimeSlots
- rating, reviews

### Lab
Extended profile for labs
- userId (reference to User)
- labName, licenseNumber, accreditation
- testsOffered, equipment
- operatingHours, rating, reviews

### Appointment
- patientId, doctorId
- appointmentDate, timeSlot, status
- reasonForVisit, symptoms, notes
- diagnosis, prescription, vitalSigns
- consultationFee, paymentStatus

### LabTest
- patientId, labId, prescribedBy
- testDetails, scheduledDate, status
- testResults, reportUrl
- totalAmount, paymentStatus
- homeCollection, collectionAddress

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Protected routes middleware
- Admin approval system for doctors and labs

## Testing the API

You can test the API using:
- **Postman** - Import the endpoints and test
- **Thunder Client** (VS Code extension)
- **curl** commands

### Example: Login Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@123"
  }'
```

### Example: Get Dashboard Stats (with JWT token)

```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Default Admin Credentials

After running the seeder:
- **Email**: admin@healthcare.com
- **Password**: Admin@123

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## Project Structure

```
backend/
├── controllers/        # Request handlers
├── models/            # Database models
├── routes/            # API routes
├── middleware/        # Custom middleware
├── seeders/           # Database seeders
├── .env.example       # Environment variables template
├── server.js          # Entry point
└── package.json       # Dependencies
```

## Development Tips

1. **Use nodemon** - Automatically restarts server on file changes (included in dev script)
2. **MongoDB Compass** - GUI for viewing and managing MongoDB data
3. **Postman Collections** - Create collections for easy API testing
4. **Environment Variables** - Never commit `.env` file to version control

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity for MongoDB Atlas

### JWT Token Errors
- Check if JWT_SECRET is set in .env
- Verify token is being sent in Authorization header
- Token format: `Bearer <token>`

### Port Already in Use
- Change PORT in .env
- Kill process using port 5000: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

## Next Steps

1. Connect frontend to backend API
2. Implement file upload for documents/reports
3. Add email notifications
4. Implement payment gateway integration
5. Add real-time notifications with Socket.io
6. Deploy to production (Heroku, AWS, etc.)

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
