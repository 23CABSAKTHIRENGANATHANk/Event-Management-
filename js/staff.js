/**
 * EMS - Staff Page Module
 * Admin-only: list, add, edit, delete staff users
 */

const StaffPage = (() => {
    let allStaff = [];
    let depts = [];

    function renderTable(staff) {
        const tb = document.getElementById('staffTable');
        if (!staff.length) {
            tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👩‍🏫</div>No staff members found</div></td></tr>';
            return;
        }
        tb.innerHTML = staff.map(s => `<tr>
            <td class="td-name">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">
                        ${(s.name || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:600;">${s.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${s.email}</div>
                    </div>
                </div>
            </td>
            <td style="color:var(--text-muted);font-size:13px;">@${s.username}</td>
            <td>${s.department_name || '<span style="color:var(--text-muted);">—</span>'}</td>
            <td style="color:var(--text-muted);font-size:12px;">${new Date(s.created_at).toLocaleDateString('en-IN')}</td>
            <td>
                <div class="td-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="StaffPage.edit('${s.id}')" title="Edit">✏️</button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="StaffPage.remove('${s.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
    }

    function filter() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        renderTable(allStaff.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.username.toLowerCase().includes(q)
        ));
    }

    function openModal(reset = true) {
        if (reset) {
            document.getElementById('modalTitle').textContent = 'Add Staff';
            ['staffId', 'staffName', 'staffEmail', 'staffUsername', 'staffPassword'].forEach(id =>
                document.getElementById(id) && (document.getElementById(id).value = ''));
            if (document.getElementById('staffDept')) document.getElementById('staffDept').value = '';
            const pw = document.getElementById('staffPassword');
            if (pw) pw.placeholder = 'Set password';
        }
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

    function edit(id) {
        const s = allStaff.find(x => x.id == id);
        if (!s) return;
        document.getElementById('modalTitle').textContent = 'Edit Staff';
        document.getElementById('staffId').value = s.id;
        document.getElementById('staffName').value = s.name;
        document.getElementById('staffEmail').value = s.email;
        document.getElementById('staffUsername').value = s.username;
        document.getElementById('staffPassword').value = '';
        document.getElementById('staffPassword').placeholder = 'Leave blank to keep current';
        if (document.getElementById('staffDept')) document.getElementById('staffDept').value = s.department_id || '';
        openModal(false);
    }

    async function save(e) {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        btn.innerHTML = '<span class="loading-spinner"></span>'; btn.disabled = true;
        const id = document.getElementById('staffId').value;
        const body = {
            name: document.getElementById('staffName').value.trim(),
            email: document.getElementById('staffEmail').value.trim(),
            username: document.getElementById('staffUsername').value.trim(),
            role: 'staff',
            department_id: document.getElementById('staffDept')?.value || null,
        };
        const pw = document.getElementById('staffPassword').value;
        if (pw) body.password = pw;
        if (id) body.id = id;
        const res = id ? await API.updateUser(body) : await API.createUser(body);
        if (res.success) {
            Toast.success(res.message || 'Saved!');
            closeModal();
            const fresh = await API.getUsers('role=staff');
            allStaff = fresh.data || [];
            renderTable(allStaff);
        } else Toast.error(res.message);
        btn.innerHTML = 'Save'; btn.disabled = false;
    }

    async function remove(id) {
        if (!confirm('Delete this staff member?')) return;
        const res = await API.deleteUser(id);
        if (res.success) {
            Toast.success('Staff deleted.');
            allStaff = allStaff.filter(s => s.id != id);
            renderTable(allStaff);
        } else Toast.error(res.message);
    }

    async function init() {
        const user = await Auth.requireAuth(['admin']);
        if (!user) return;
        Sidebar.render(user, 'staff');
        const [staffRes, deptRes] = await Promise.all([
            API.getUsers('role=staff'), API.getDepartments()
        ]);
        allStaff = staffRes.data || [];
        depts = deptRes.data || [];
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id; opt.textContent = d.department_name;
            document.getElementById('staffDept')?.appendChild(opt);
        });
        renderTable(allStaff);
        document.getElementById('searchInput')?.addEventListener('input', filter);
    }

    return { init, edit, remove, save, openModal, closeModal };
})();

window.StaffPage = StaffPage;
document.addEventListener('DOMContentLoaded', () => StaffPage.init());
