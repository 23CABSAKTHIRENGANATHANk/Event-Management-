/**
 * EMS - Students Page Module
 * Admin-only: list, add, edit, delete students
 */

const StudentsPage = (() => {
    let allStudents = [];

    const ROLE_BADGE = {
        student: 'badge-blue', participant: 'badge-cyan',
        staff: 'badge-orange', admin: 'badge-red'
    };

    function renderTable(students) {
        const tb = document.getElementById('studentsTable');
        if (!students.length) {
            tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🎓</div>No students found</div></td></tr>';
            return;
        }
        tb.innerHTML = students.map(s => `<tr>
            <td class="td-name">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">
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
            <td><span class="badge ${ROLE_BADGE[s.role] || 'badge-blue'}">${s.role}</span></td>
            <td>
                <div class="td-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="StudentsPage.edit('${s.id}')" title="Edit">✏️</button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="StudentsPage.remove('${s.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
    }

    function filter() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        renderTable(allStudents.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (s.department_name || '').toLowerCase().includes(q)
        ));
    }

    function openModal(reset = true) {
        if (reset) {
            document.getElementById('modalTitle').textContent = 'Add Student';
            ['studentId', 'studentName', 'studentEmail', 'studentUsername', 'studentPassword'].forEach(id =>
                document.getElementById(id) && (document.getElementById(id).value = ''));
            if (document.getElementById('studentDept')) document.getElementById('studentDept').value = '';
            if (document.getElementById('studentRole')) document.getElementById('studentRole').value = 'student';
        }
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

    function edit(id) {
        const s = allStudents.find(x => x.id == id);
        if (!s) return;
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentId').value = s.id;
        document.getElementById('studentName').value = s.name;
        document.getElementById('studentEmail').value = s.email;
        document.getElementById('studentUsername').value = s.username;
        document.getElementById('studentPassword').value = '';
        document.getElementById('studentPassword').placeholder = 'Leave blank to keep current';
        if (document.getElementById('studentDept')) document.getElementById('studentDept').value = s.department_id || '';
        if (document.getElementById('studentRole')) document.getElementById('studentRole').value = s.role || 'student';
        openModal(false);
    }

    async function save(e) {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        btn.innerHTML = '<span class="loading-spinner"></span>'; btn.disabled = true;
        const id = document.getElementById('studentId').value;
        const body = {
            name: document.getElementById('studentName').value.trim(),
            email: document.getElementById('studentEmail').value.trim(),
            username: document.getElementById('studentUsername').value.trim(),
            role: document.getElementById('studentRole')?.value || 'student',
            department_id: document.getElementById('studentDept')?.value || null,
        };
        const pw = document.getElementById('studentPassword').value;
        if (pw) body.password = pw;
        if (id) body.id = id;
        const res = id ? await API.updateUser(body) : await API.createUser(body);
        if (res.success) {
            Toast.success(res.message || 'Saved!');
            closeModal();
            reload();
        } else Toast.error(res.message);
        btn.innerHTML = 'Save'; btn.disabled = false;
    }

    async function remove(id) {
        if (!confirm('Delete this student?')) return;
        const res = await API.deleteUser(id);
        if (res.success) {
            Toast.success('Student deleted.');
            allStudents = allStudents.filter(s => s.id != id);
            renderTable(allStudents);
        } else Toast.error(res.message);
    }

    async function reload() {
        const res = await API.getUsers('role=student');
        allStudents = res.data || [];
        renderTable(allStudents);
    }

    async function init() {
        const user = await Auth.requireAuth(['admin']);
        if (!user) return;
        Sidebar.render(user, 'students');
        const [studRes, deptRes] = await Promise.all([
            API.getUsers('role=student'), API.getDepartments()
        ]);
        allStudents = studRes.data || [];
        (deptRes.data || []).forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id; opt.textContent = d.department_name;
            document.getElementById('studentDept')?.appendChild(opt);
        });
        renderTable(allStudents);
        document.getElementById('searchInput')?.addEventListener('input', filter);
    }

    return { init, edit, remove, save, openModal, closeModal };
})();

window.StudentsPage = StudentsPage;
document.addEventListener('DOMContentLoaded', () => StudentsPage.init());
