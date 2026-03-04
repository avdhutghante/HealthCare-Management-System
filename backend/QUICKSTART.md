# Quick Start Guide

## Setup Instructions

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# notepad .env

# Create admin user
npm run seed

# Start development server
npm run dev
```

Server will run on: http://localhost:5000

### 3. Test the Backend

**Test Health Check:**
```powershell
curl http://localhost:5000/api/health
```

**Test Admin Login:**
```powershell
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@healthcare.com\",\"password\":\"Admin@123\"}"
```

### 4. Frontend Setup (Update your React app)

Install axios for API calls:
```powershell
cd ..
npm install axios
```

Create API configuration file:
```javascript
// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## User Workflow

### For Admin
1. Login with default credentials
2. View pending doctor/lab approvals
3. Approve or reject applications
4. View dashboard statistics
5. Manage all users

### For Doctor (Registration & Approval)
1. Register as doctor with required details
2. Wait for admin approval
3. Once approved, login and set up profile
4. Manage appointments
5. Add diagnoses and prescriptions

### For Lab (Registration & Approval)
1. Register as lab with license details
2. Wait for admin approval
3. Once approved, login and set up services
4. Manage test bookings
5. Upload test results

### For Patient
1. Register (auto-approved)
2. Browse doctors and labs
3. Book appointments
4. Book lab tests
5. View history and reports

## API Testing with Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create new collection "Healthcare API"
3. Test these endpoints:

**Auth:**
- POST: http://localhost:5000/api/auth/register
- POST: http://localhost:5000/api/auth/login
- GET: http://localhost:5000/api/auth/me (add Bearer token)

**Admin:**
- GET: http://localhost:5000/api/admin/stats (Bearer token)
- GET: http://localhost:5000/api/admin/pending-approvals (Bearer token)

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Run `npm install` again

### Can't connect to MongoDB
- Local: Ensure MongoDB service is running
- Atlas: Check connection string and network access

### 401 Unauthorized errors
- Login first to get JWT token
- Add token to Authorization header: `Bearer <your-token>`

### Port 5000 already in use
- Change PORT in .env to another value (e.g., 5001)
- Or kill the process using port 5000

## Development Workflow

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev`
4. Open browser: http://localhost:5173

## Next Steps

- [ ] Integrate frontend with backend API
- [ ] Replace mock data with real API calls
- [ ] Add authentication context in React
- [ ] Create admin dashboard UI
- [ ] Implement doctor/lab approval UI
- [ ] Add appointment booking with real data
- [ ] Add lab test booking with real data
