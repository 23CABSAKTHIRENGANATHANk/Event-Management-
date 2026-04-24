# 🎪 Event Management System (EMS)

A centralized web platform for managing events across **Admin, Staff, Student, and Participant** roles.

---

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3 (Dark Glassmorphism), Vanilla JS, Chart.js |
| Backend  | Python (Flask) |
| Database | MongoDB Atlas |

---

## 📂 Folder Structure

```
Event_Management/
├── index.html                    ← Entry point
├── login.html                    ← Login / Register page
├── app.py                        ← Main Flask application
├── database.py                   ← MongoDB connection helper
├── routes/                       ← Backend API routes
├── pages/                        ← Frontend pages
├── js/                           ← Frontend logic
└── assets/                       ← Images and static assets
```

---

## 🚀 Setup Instructions

### Step 1 — Configure Environment
1. Create a `.env` file based on `.env.example`.
2. Add your `MONGO_URI` and `SECRET_KEY`.

### Step 2 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3 — Seed Database (Optional)
```bash
python seed.py
```

### Step 4 — Run the App
```bash
python app.py
```

---

## 🔒 Security & Privacy

- **Real Authentication**: Uses `bcrypt` for secure server-side password hashing.
- **Session Security**: Managed via Flask signed sessions.
- **No External Tracking**: No unknown external scripts or trackers are included.
- **No Auto-Downloads**: All exports (e.g., CSV) are explicitly triggered by the user.
- **Demo Mode**: This project is for demonstration purposes. No real personal data should be stored.

---

## 🔑 Demo Credentials

| Role        | Username   | Password   |
|-------------|-----------|-----------|
| 👑 Admin     | `admin`   | `password` |
| 👩‍🏫 Staff     | `staff1`  | `password` |
| 🎓 Student   | `alice`   | `password` |
| 🌍 Participant | `dave`  | `password` |

---

## ✨ Features by Role

### 👑 Admin
- Dashboard with stats, charts, recent activity
- Full CRUD: Departments, Staff, Students, Events
- View all registrations, mark attendance
- Generate and export reports (CSV)

### 👩‍🏫 Staff
- Dashboard showing assigned events and participants
- View and update event details
- Mark student/participant attendance

### 🎓 Student
- Browse upcoming events
- One-click registration (with duplicate & capacity checks)
- View own registration and attendance status

### 🌍 External Participant
- Self-register account
- Browse and join public events
- View registration status
