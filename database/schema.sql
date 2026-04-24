-- ============================================
-- Event Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS TABLE (Admin / Staff / Student / Participant)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','staff','student','participant') NOT NULL DEFAULT 'student',
    department_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(200),
    department_id INT NULL,
    staff_id INT NULL,
    capacity INT DEFAULT 100,
    registration_deadline DATE,
    status ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_status ENUM('confirmed','pending','cancelled') DEFAULT 'confirmed',
    attendance_status ENUM('present','absent','not_marked') DEFAULT 'not_marked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_registration (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA
-- ============================================

-- Departments
INSERT INTO departments (department_name, description) VALUES
('Computer Science', 'CS department handling tech events'),
('Management Studies', 'Business and management department'),
('Arts & Design', 'Creative arts and design department'),
('Civil Engineering', 'Infrastructure and engineering department'),
('Electronics', 'Electronics and communication department');

-- Users: ALL passwords are "password" (bcrypt via PHP password_hash)
-- $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi = bcrypt("password")
INSERT INTO users (name, email, username, password, role, department_id) VALUES
('Super Admin',    'admin@ems.com',       'admin',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',       NULL),
('John Staff',     'staff@ems.com',       'staff1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff',       1),
('Jane Staff',     'jane@ems.com',        'staff2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff',       2),
('Alice Student',  'alice@ems.com',       'alice',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',     1),
('Bob Student',    'bob@ems.com',         'bob',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',     2),
('Carol Student',  'carol@ems.com',       'carol',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',     1),
('Dave Extern',    'dave@external.com',   'dave',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'participant', NULL),
('Eva Extern',     'eva@external.com',    'eva',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'participant', NULL);

-- Events
INSERT INTO events (event_name, description, event_date, location, department_id, staff_id, capacity, registration_deadline, status) VALUES
('Tech Symposium 2026',     'Annual technology conference',      '2026-03-15', 'Main Auditorium',  1, 2, 200, '2026-03-10', 'upcoming'),
('Business Case Study',     'MBA case study competition',        '2026-03-20', 'Seminar Hall B',   2, 3, 80,  '2026-03-18', 'upcoming'),
('Design Hackathon',        '24-hour design sprint competition',  '2026-04-05', 'Innovation Lab',   3, 2, 60,  '2026-04-01', 'upcoming'),
('Civil Expo 2026',         'Infrastructure project exhibition',  '2026-04-12', 'Exhibition Ground',4, 3, 150, '2026-04-08', 'upcoming'),
('Electronics Workshop',    'IoT and embedded systems workshop',  '2026-02-28', 'Lab 201',          5, 2, 40,  '2026-02-25', 'ongoing'),
('AI & ML Summit',          'Artificial Intelligence summit',     '2026-01-20', 'Conference Hall',  1, 2, 120, '2026-01-15', 'completed');

-- Registrations
INSERT INTO event_registrations (user_id, event_id, registration_status, attendance_status) VALUES
(4, 1, 'confirmed', 'not_marked'),
(5, 1, 'confirmed', 'not_marked'),
(4, 3, 'confirmed', 'not_marked'),
(6, 2, 'confirmed', 'not_marked'),
(7, 1, 'confirmed', 'not_marked'),
(8, 2, 'confirmed', 'not_marked'),
(4, 6, 'confirmed', 'present'),
(5, 6, 'confirmed', 'absent'),
(6, 6, 'confirmed', 'present'),
(7, 6, 'confirmed', 'present');
