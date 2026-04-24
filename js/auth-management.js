/**
 * EMS - Auth Management Module
 * Manages all user credentials and roles
 */

let allUsers = [];
const ROLE_BADGE = { admin: 'badge-red', staff: 'badge-orange', student: 'badge-blue', participant: 'badge-cyan' };

function fmt(d) { 
    if (!d) return 'N/A';
    const date = (d.$date) ? new Date(d.$date) : new Date(d);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AuthManagement = {
    async init() {
        const user = await Auth.requireAuth(['admin']);
        if (!user) return;
        Sidebar.render(user, 'auth-management');
        document.getElementById('navUser').textContent = user.name;

        await this.loadDepartments();
        await this.loadUsers();

        // Search listener
        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Form submit
        document.getElementById('editForm').addEventListener('submit', (e) => this.handleUpdate(e));
    },

    async loadDepartments() {
        const res = await API.getDepartments();
        if (res.success) {
            const select = document.getElementById('editDept');
            res.data.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.department_name;
                select.appendChild(opt);
            });
        }
    },

    async loadUsers() {
        const res = await API.getUsers();
        if (res.success) {
            allUsers = res.data;
            this.renderTable(allUsers);
        } else {
            Toast.error('Failed to load users');
        }
    },

    renderTable(users) {
        const tbody = document.getElementById('userTableBody');
        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No users found</div></td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td class="td-name">${u.name}</td>
                <td><code style="background:var(--bg-card-hover);padding:2px 6px;border-radius:4px;">${u.username}</code></td>
                <td>${u.email}</td>
                <td><span class="badge ${ROLE_BADGE[u.role] || 'badge-blue'}">${u.role}</span></td>
                <td>${fmt(u.created_at)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="AuthManagement.openEditModal('${u.id}')">Edit Auth</button>
                </td>
            </tr>
        `).join('');
    },

    filterUsers(query) {
        const q = query.toLowerCase();
        const filtered = allUsers.filter(u => 
            u.name.toLowerCase().includes(q) || 
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
        this.renderTable(filtered);
    },

    openEditModal(userId) {
        const u = allUsers.find(user => user.id === userId);
        if (!u) return;

        document.getElementById('editId').value = u.id;
        document.getElementById('editName').value = u.name;
        document.getElementById('editEmail').value = u.email;
        document.getElementById('editUsername').value = u.username;
        document.getElementById('editPassword').value = '';
        document.getElementById('editRole').value = u.role;
        document.getElementById('editDept').value = u.department_id || '';

        document.getElementById('editModalOverlay').classList.add('active');
    },

    async handleUpdate(e) {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const body = {
            id,
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            username: document.getElementById('editUsername').value,
            role: document.getElementById('editRole').value,
            department_id: document.getElementById('editDept').value || null,
        };

        const pw = document.getElementById('editPassword').value;
        if (pw) body.password = pw;

        const res = await API.updateUser(body);
        if (res.success) {
            Toast.success('Login credentials updated successfully');
            closeModal();
            this.loadUsers();
        } else {
            Toast.error(res.message || 'Update failed');
        }
    }
};

function closeModal() {
    document.getElementById('editModalOverlay').classList.remove('active');
}

// Global scope for onclick
window.AuthManagement = AuthManagement;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', () => AuthManagement.init());
