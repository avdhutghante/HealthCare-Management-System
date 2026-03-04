# API Testing Guide

## Quick Test Commands

### 1. Test Root Endpoint
```powershell
curl http://localhost:5000
```
**Expected Response:** Welcome message with API endpoints

### 2. Test Health Check
```powershell
curl http://localhost:5000/api/health
```
**Expected Response:** `{"status":"OK","message":"Server is running"}`

### 3. Test Admin Login
```powershell
$body = @{
    email = "admin@healthcare.com"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body $body -ContentType "application/json"
```
**Expected Response:** Token and user data

### 4. Get Dashboard Stats (requires token from step 3)
```powershell
# Replace YOUR_TOKEN with the token from login
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
}

Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/admin/stats" -Headers $headers
```

## Using Postman (Recommended)

### Setup:
1. Download Postman: https://www.postman.com/downloads/
2. Create new collection "Healthcare API"
3. Set base URL: `http://localhost:5000`

### Test Requests:

#### 1. Login (POST)
- URL: `{{baseUrl}}/api/auth/login`
- Body (JSON):
```json
{
  "email": "admin@healthcare.com",
  "password": "Admin@123"
}
```
- Save the token from response!

#### 2. Get Dashboard Stats (GET)
- URL: `{{baseUrl}}/api/admin/stats`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN_HERE`

#### 3. Get All Doctors (GET)
- URL: `{{baseUrl}}/api/doctors`
- No auth required (public endpoint)

#### 4. Register Patient (POST)
- URL: `{{baseUrl}}/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test Patient",
  "email": "patient@test.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "patient"
}
```

#### 5. Register Doctor (POST) - Requires Admin Approval
- URL: `{{baseUrl}}/api/auth/register`
- Body (JSON):
```json
{
  "name": "Dr. Test Doctor",
  "email": "doctor@test.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "doctor",
  "doctorData": {
    "specialty": "Cardiologist",
    "experience": 10,
    "licenseNumber": "MD123456",
    "consultationFee": 500,
    "hospitalAffiliation": {
      "name": "City Hospital",
      "address": "123 Medical St",
      "city": "Hadapsar"
    },
    "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
}
```

#### 6. Get Pending Approvals (GET)
- URL: `{{baseUrl}}/api/admin/pending-approvals`
- Headers: `Authorization: Bearer YOUR_ADMIN_TOKEN`

#### 7. Approve Doctor (PUT)
- URL: `{{baseUrl}}/api/admin/approve/DOCTOR_USER_ID`
- Headers: `Authorization: Bearer YOUR_ADMIN_TOKEN`

## Common Issues

### "Cannot GET /"
✅ **FIXED!** The root route now returns a welcome message

### "404 Not Found"
- Check the URL path
- Make sure server is running on port 5000
- Verify the route in server.js

### "401 Unauthorized"
- You need to login first
- Add token to Authorization header: `Bearer YOUR_TOKEN`

### "Connection refused"
- Server is not running
- Run: `cd backend && npm run dev`
- Check if MongoDB is running

### CORS errors
- Backend is configured for `http://localhost:5173`
- Update `FRONTEND_URL` in `.env` if needed

## Server Status Check

If server is running, you should see:
```
✅ MongoDB Connected Successfully
🚀 Server is running on port 5000
📍 Environment: development
```

## Refresh Browser

After the server restarts, refresh your browser at `http://localhost:5000`

You should now see a JSON response with API information instead of "Cannot GET /"!
