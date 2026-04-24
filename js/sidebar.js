/**
 * EMS - Sidebar Module
 * Dynamic sidebar based on role, active page highlighting, toast notifications
 */

const SIDEBARS = {
    admin: [
        { label: '📊 Dashboard', href: '/pages/dashboard-admin.html', id: 'dashboard' },
        { label: '📁 Departments', href: '/pages/departments.html', id: 'departments' },
        { label: '👩‍🏫 Staff', href: '/pages/staff.html', id: 'staff' },
        { label: '🎓 Students', href: '/pages/students.html', id: 'students' },
        { label: '📅 Events', href: '/pages/events.html', id: 'events' },
        { label: '📝 Registrations', href: '/pages/registrations.html', id: 'registrations' },
        { label: '🔑 Auth Management', href: '/pages/auth-management.html', id: 'auth-management' },
        { label: '📈 Reports', href: '/pages/reports.html', id: 'reports' },
    ],
    staff: [
        { label: '📊 Dashboard', href: '/pages/dashboard-staff.html', id: 'dashboard' },
        { label: '📅 My Events', href: '/pages/events.html', id: 'events' },
        { label: '📝 Participants', href: '/pages/registrations.html', id: 'registrations' },
    ],
    student: [
        { label: '📊 Dashboard', href: '/pages/dashboard-student.html', id: 'dashboard' },
        { label: '📅 Events', href: '/pages/events.html', id: 'events' },
        { label: '📋 My Registrations', href: '/pages/registrations.html', id: 'registrations' },
    ],
    participant: [
        { label: '📊 Dashboard', href: '/pages/dashboard-participant.html', id: 'dashboard' },
        { label: '📅 Events', href: '/pages/events.html', id: 'events' },
        { label: '📋 My Events', href: '/pages/registrations.html', id: 'registrations' },
    ],
};

const Sidebar = {
    render(user, activeId = 'dashboard') {
        const links = SIDEBARS[user.role] || [];
        const initial = (user.name || 'U')[0].toUpperCase();
        const currentPath = window.location.pathname;

        const html = `
      <div class="sidebar-logo">
        <div class="logo-icon">
          <img src="/assets/images/logo.png" alt="Logo">
        </div>
        <div>
          <h2>EMS</h2>
          <span>Event Management</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-title">Menu</div>
        ${links.map(link => {
            const isActive = currentPath.includes(link.id) ||
                (activeId === link.id);
            return `
            <a href="${link.href}" class="nav-item ${isActive ? 'active' : ''}">
              <span class="nav-icon">${link.label.split(' ')[0]}</span>
              <span>${link.label.split(' ').slice(1).join(' ')}</span>
            </a>`;
        }).join('')}
        <div class="nav-section-title">Account</div>
        <div class="nav-item logout-item" onclick="Auth.logout()">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </nav>
      <div class="sidebar-user">
        <div class="avatar">${initial}</div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <span class="user-role">${user.role}</span>
        </div>
      </div>
    `;

        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.innerHTML = html;

        // Mobile toggle
        const toggleBtn = document.getElementById('menuToggle');
        const overlay = document.getElementById('sidebarOverlay');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
        if (overlay) {
            overlay.addEventListener('click', () => sidebar.classList.remove('open'));
        }
    }
};

// ========== TOAST ==========
const Toast = {
    container: null,
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    show(message, type = 'info', duration = 3500) {
        this.init();
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    success: (msg) => Toast.show(msg, 'success'),
    error: (msg) => Toast.show(msg, 'error'),
    info: (msg) => Toast.show(msg, 'info'),
};

window.Sidebar = Sidebar;
window.Toast = Toast;
