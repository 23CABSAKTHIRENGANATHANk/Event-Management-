/**
 * EMS - Departments Page Module
 * Admin-only: list, add, edit, delete departments
 */

const DepartmentsPage = (() => {
    let allDepts = [];

    function renderTable(depts) {
        const tb = document.getElementById('deptsTable');
        if (!depts.length) {
            tb.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📁</div>No departments yet</div></td></tr>';
            return;
        }
        tb.innerHTML = depts.map((d, i) => `<tr>
            <td style="color:var(--text-muted);font-size:13px;">${i + 1}</td>
            <td class="td-name">${d.department_name}</td>
            <td style="max-width:300px;color:var(--text-secondary);font-size:13px;">${d.description || '—'}</td>
            <td>
                <div class="td-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="DepartmentsPage.edit('${d.id}')" title="Edit">✏️</button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="DepartmentsPage.remove('${d.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
    }

    function filter() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        renderTable(allDepts.filter(d => d.department_name.toLowerCase().includes(q)));
    }

    function openModal(reset = true) {
        if (reset) {
            document.getElementById('modalTitle').textContent = 'Add Department';
            document.getElementById('deptId').value = '';
            document.getElementById('deptName').value = '';
            document.getElementById('deptDesc').value = '';
        }
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

    function edit(id) {
        const d = allDepts.find(x => x.id == id);
        if (!d) return;
        document.getElementById('modalTitle').textContent = 'Edit Department';
        document.getElementById('deptId').value = d.id;
        document.getElementById('deptName').value = d.department_name;
        document.getElementById('deptDesc').value = d.description || '';
        openModal(false);
    }

    async function save(e) {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        btn.innerHTML = '<span class="loading-spinner"></span>'; btn.disabled = true;
        const id = document.getElementById('deptId').value;
        const body = {
            department_name: document.getElementById('deptName').value.trim(),
            description: document.getElementById('deptDesc').value.trim(),
        };
        if (id) body.id = id;
        const res = id ? await API.updateDepartment(body) : await API.createDepartment(body);
        if (res.success) {
            Toast.success(res.message || 'Saved!');
            closeModal();
            const fresh = await API.getDepartments();
            allDepts = fresh.data || [];
            renderTable(allDepts);
        } else Toast.error(res.message);
        btn.innerHTML = 'Save'; btn.disabled = false;
    }

    async function remove(id) {
        if (!confirm('Delete this department?')) return;
        const res = await API.deleteDepartment(id);
        if (res.success) {
            Toast.success('Department deleted.');
            allDepts = allDepts.filter(d => d.id != id);
            renderTable(allDepts);
        } else Toast.error(res.message);
    }

    async function init() {
        const user = await Auth.requireAuth(['admin']);
        if (!user) return;
        Sidebar.render(user, 'departments');
        const res = await API.getDepartments();
        allDepts = res.data || [];
        renderTable(allDepts);
        document.getElementById('searchInput')?.addEventListener('input', filter);
    }

    return { init, edit, remove, save, openModal, closeModal };
})();

window.DepartmentsPage = DepartmentsPage;
document.addEventListener('DOMContentLoaded', () => DepartmentsPage.init());
