<div align="center">

# 🏥 HealthCare Management System

### *Your Complete Healthcare Management Solution*

<br/>

[![Made with React](https://img.shields.io/badge/Made%20with-React%2018-00D8FF?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6F61?style=for-the-badge&logo=openai&logoColor=white)](#)

<br/>

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🩺  Book Appointments  •  💊  AI Diagnosis  •  🔬  Lab Tests   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

[View Demo](#-getting-started) • [Features](#-key-features) • [Installation](#-installation) • [Tech Stack](#️-tech-stack)

---

</div>

## 🎯 Overview

**HealthCare Management System** is a modern, full-stack healthcare management platform that bridges the gap between patients, doctors, and laboratories. Built with cutting-edge technologies and AI integration for smarter healthcare decisions.

<br/>

## 🌟 Key Features

<table>
<tr>
<td width="50%">

### 👤 **For Patients**
| Feature | Description |
|---------|-------------|
| 📅 Smart Booking | Easy appointment scheduling |
| 🤖 AI Symptom Checker | AI-powered health analysis |
| 💓 Heart Health | Predictive heart disease assessment |
| 📊 BMI Calculator | Track your fitness metrics |
| 🔬 Lab Bookings | Book tests from certified labs |
| 📋 Visit History | Complete medical records |

</td>
<td width="50%">

### 👨‍⚕️ **For Doctors**
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Comprehensive patient overview |
| 📆 Schedule | Manage appointments efficiently |
| ✅ Approvals | Accept/reject appointments |
| 📝 Records | Access patient history |

### 🔬 **For Labs**
| Feature | Description |
|---------|-------------|
| 🧪 Test Management | Process test requests |
| 📤 Results | Upload and share results |

</td>
</tr>
</table>

<br/>

### 👑 **Admin Capabilities**
```
┌─────────────────┬─────────────────┬─────────────────┐
│  📈 Analytics   │  👥 User Mgmt   │  🏥 Resources   │
├─────────────────┼─────────────────┼─────────────────┤
│ System metrics  │ Manage doctors  │ Lab management  │
│ Usage stats     │ Patient data    │ Appointments    │
│ Reports         │ Role control    │ Configurations  │
└─────────────────┴─────────────────┴─────────────────┘
```

<br/>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
|:-----:|:-------------|
| **Frontend** | ![React](https://img.shields.io/badge/-React_18-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white) ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white) !|
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square&logoColor=white) |
| **AI/ML** | ![Google AI](https://img.shields.io/badge/-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white) ![HuggingFace](https://img.shields.io/badge/-HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black) |
| **Auth** | ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/-bcrypt-003A70?style=flat-square&logoColor=white) |

</div>

<br/>

---

## 🚀 Installation

### Prerequisites
```bash
✓ Node.js v16+
✓ MongoDB Atlas Account
✓ Git
```

### Quick Start

```bash
# 1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/medicare-plus.git
cd medicare-plus

# 2️⃣ Install dependencies
npm install              # Frontend
cd backend && npm install   # Backend

# 3️⃣ Configure environment
# Create backend/.env file with:
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development

# 4️⃣ Seed database (optional)
npm run seed
npm run seed:doctors
npm run seed:lab

# 5️⃣ Start the application
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
npm run dev
```

### 🌐 Access Points
| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |

<br/>

---

## 📁 Project Architecture

```
medicare-plus/
│
├── 📂 components/
│   ├── 📂 pages/                 # React page components
│   │   ├── Dashboard.jsx         # Patient dashboard
│   │   ├── DoctorDashboard.jsx   # Doctor portal
│   │   ├── AdminDashboard.jsx    # Admin control panel
│   │   ├── LabDashboard.jsx      # Lab management
│   │   ├── AISymptomChecker.jsx  # AI diagnosis
│   │   ├── BookAppointment.jsx   # Appointment booking
│   │   └── ...
│   │
│   └── 📂 utils/                 # Utilities & hooks
│       ├── App.jsx               # Main app component
│       ├── AuthContext.jsx       # Authentication context
│       ├── api.js                # API service layer
│       └── realTimeSync.js       # Real-time updates
│
├── 📂 backend/
│   ├── 📂 controllers/           # Business logic
│   ├── 📂 models/                # MongoDB schemas
│   ├── 📂 routes/                # API endpoints
│   ├── 📂 middleware/            # Auth & validation
│   ├── 📂 seeders/               # Database seeders
│   ├── 📂 services/              # External services
│   └── server.js                 # Entry point
│
└── 📂 assets/                    # Static resources
```

<br/>

---

## 🔐 Demo Credentials

<div align="center">

| Role | Email | Password |
|:----:|:------|:---------|
| 👑 **Admin** | `admin@healthcare.com` | `admin123` |
| 👨‍⚕️ **Doctor** | `doctor@demo.com` | `doctor123` |
| 👤 **Patient** | `patient@demo.com` | `patient123` |
| 🔬 **Lab** | `lab@demo.com` | `lab123` |

</div>

<br/>

---

## 📡 API Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Get current user |

</details>

<details>
<summary><b>📅 Appointments</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/appointments` | Get all appointments |
| `POST` | `/api/appointments` | Book appointment |
| `PUT` | `/api/appointments/:id` | Update appointment |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |

</details>

<details>
<summary><b>👨‍⚕️ Doctors</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctors` | List all doctors |
| `GET` | `/api/doctors/:id` | Get doctor details |

</details>

<details>
<summary><b>🔬 Lab Tests</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lab-tests` | Get all lab tests |
| `POST` | `/api/lab-tests` | Book lab test |

</details>

<br/>

---

## 🤝 Contributing

Contributions make the open-source community amazing! Any contributions are **greatly appreciated**.

```bash
1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
```

<br/>

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<br/>

---

<div align="center">

### 💖 Made with passion for better healthcare

<br/>

**[⬆ Back to Top](#-medicare-plus)**

<br/>

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/medicare-plus?style=social)](https://github.com/YOUR_USERNAME/medicare-plus)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/medicare-plus?style=social)](https://github.com/YOUR_USERNAME/medicare-plus)

</div>
