# 🎪 Event Management System (EMS)

A centralized web platform for managing events across **Admin, Staff, Student, and Participant** roles.

---

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3 (Dark Glassmorphism), Vanilla JS, Chart.js |
| Backend  | PHP 8+ (REST API) |
| Database | MySQL 5.7+ |

---

## 📂 Folder Structure

```
Event_Management/
├── index.html                    ← Entry point (redirects to login)
├── login.html                    ← Login / Register page
├── pages/
│   ├── dashboard-admin.html
│   ├── dashboard-staff.html
│   ├── dashboard-student.html
│   ├── dashboard-participant.html
│   ├── events.html
│   ├── departments.html
│   ├── staff.html
│   ├── students.html
│   ├── registrations.html
│   └── reports.html
├── css/
│   └── style.css                 ← Complete design system
├── js/
│   ├── api.js                    ← Centralized API helpers
│   ├── auth.js                   ← Auth / session / routing
│   ├── sidebar.js                ← Sidebar + Toast
│   └── charts.js                 ← Chart.js wrappers
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── register.php
│   │   └── session.php
│   ├── events.php
│   ├── departments.php
│   ├── users.php
│   ├── registrations.php
│   ├── dashboard.php
│   └── reports.php
├── config/
│   └── db.php                    ← DB connection (edit credentials here)
└── database/
    └── schema.sql                ← Database setup script
```

---

## 🚀 Setup Instructions

### Step 1 — Set up the Database

1. Open **phpMyAdmin** or any MySQL client
2. Run the script:
   ```sql
   source e:/project/project/Event_Management/database/schema.sql
   ```
   This creates the `event_management` database with all tables and **seed data**.

### Step 2 — Configure Database Connection

Edit `config/db.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');      // ← Your MySQL username
define('DB_PASS', '');          // ← Your MySQL password
define('DB_NAME', 'event_management');
```

### Step 3 — Start PHP Development Server

Open a terminal in the project root and run:
```bash
php -S localhost:8000
```

### Step 4 — Open in Browser

Visit: **http://localhost:8000**

---

## 🔑 Demo Credentials

| Role        | Username   | Password   |
|-------------|-----------|-----------|
| 👑 Admin     | `admin`   | `password` |
| 👩‍🏫 Staff     | `staff1`  | `password` |
| 🎓 Student   | `alice`   | `password` |
| 🌍 Participant | `dave`  | `password` |

> **Note:** Demo login buttons are available on the login page for quick access.

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

---

## 🗄️ Database Schema

```
users              → id, name, email, username, password, role, department_id
departments        → id, department_name, description
events             → id, event_name, description, event_date, location, department_id, staff_id, capacity, registration_deadline, status
event_registrations → id, user_id, event_id, registration_status, attendance_status
```

---

## 🔐 Security Features

- PHP `password_hash()` / `password_verify()` for all passwords
- Server-side role checks on every API endpoint
- Duplicate registration prevention (UNIQUE constraint)
- Capacity enforcement before registration
- Session-based authentication
