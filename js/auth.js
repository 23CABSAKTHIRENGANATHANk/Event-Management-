/**
 * EMS - Auth Module
 * Handles login, logout, session, and role-based routing
 */

const Auth = {
    /**
     * Get the current user from sessionStorage
     */
    getUser() {
        try {
            return JSON.parse(sessionStorage.getItem('ems_user')) || null;
        } catch { return null; }
    },

    /**
     * Save user to sessionStorage
     */
    setUser(user) {
        sessionStorage.setItem('ems_user', JSON.stringify(user));
    },

    /**
     * Clear user from sessionStorage
     */
    clearUser() {
        sessionStorage.removeItem('ems_user');
    },

    /**
     * Dashboard path by role
     */
    getDashboardPath(role) {
        const paths = {
            admin: '/pages/dashboard-admin.html',
            staff: '/pages/dashboard-staff.html',
            student: '/pages/dashboard-student.html',
            participant: '/pages/dashboard-participant.html',
        };
        return paths[role] || '/login.html';
    },

    /**
     * Redirect if not authenticated (call on protected pages)
     */
    async requireAuth(allowedRoles = []) {
        const res = await API.session();
        if (!res.logged_in) {
            window.location.href = '/login.html';
            return null;
        }
        const user = res.user;
        this.setUser(user);
        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            window.location.href = this.getDashboardPath(user.role);
            return null;
        }
        return user;
    },

    /**
     * Handle login form submission
     */
    async login(username, password) {
        const res = await API.login({ username, password });
        if (res.success) {
            this.setUser(res.user);
        }
        return res;
    },

    /**
     * Handle logout
     */
    async logout() {
        await API.logout();
        this.clearUser();
        window.location.href = '/login.html';
    },
};

window.Auth = Auth;
