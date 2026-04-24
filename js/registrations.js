/**
 * EMS - Registrations Page Module
 * View registrations, mark attendance, register for/cancel events
 */

const RegistrationsPage = (() => {
    let allRegs = [];
    let currentUser = null;

    const ATT_BADGE = { present: 'badge-green', absent: 'badge-red', not_marked: 'badge-blue' };
    const STAT_BADGE = { confirmed: 'badge-green', pending: 'badge-orange', cancelled: 'badge-red' };
    const ROLE_BADGE = { admin: 'badge-red', staff: 'badge-orange', student: 'badge-blue', participant: 'badge-cyan' };

    function fmt(d) {
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderTable(regs) {
        const tb = document.getElementById('regsTable');
        const isAdminStaff = ['admin', 'staff'].includes(currentUser?.role);
        if (!regs.length) {
            tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div>No registrations found</div></td></tr>';
            return;
        }
        tb.innerHTML = regs.map(r => `<tr>
            <td class="td-name">${r.name}</td>
            <td>${r.event_name}</td>
            <td><span class="badge ${ROLE_BADGE[r.user_role] || 'badge-blue'}">${r.user_role}</span></td>
            <td><span class="badge ${STAT_BADGE[r.registration_status] || 'badge-blue'}">${r.registration_status}</span></td>
            <td>
                ${isAdminStaff
                ? `<select class="form-control" style="padding:4px 8px;font-size:12px;max-width:130px;" onchange="RegistrationsPage.markAttendance('${r.id}', this.value)">
                        <option value="not_marked" ${r.attendance_status === 'not_marked' ? 'selected' : ''}>Not Marked</option>
                        <option value="present"    ${r.attendance_status === 'present' ? 'selected' : ''}>✅ Present</option>
                        <option value="absent"     ${r.attendance_status === 'absent' ? 'selected' : ''}>❌ Absent</option>
                      </select>`
                : `<span class="badge ${ATT_BADGE[r.attendance_status] || 'badge-blue'}">${r.attendance_status.replace('_', ' ')}</span>`
            }
            </td>
            <td>${fmt(r.created_at)}</td>
        </tr>`).join('');
    }

    function filter() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const ev = document.getElementById('eventFilter')?.value || '';
        renderTable(allRegs.filter(r =>
            (!q || r.name.toLowerCase().includes(q) || r.event_name.toLowerCase().includes(q)) &&
            (!ev || r.event_id == ev)
        ));
    }

    async function markAttendance(id, status) {
        const reg = allRegs.find(r => r.id == id);
        if (!reg) return;
        const res = await API.updateRegistration({ id, attendance_status: status, registration_status: reg.registration_status });
        if (res.success) {
            Toast.success('Attendance updated.');
            const idx = allRegs.findIndex(r => r.id == id);
            if (idx !== -1) allRegs[idx].attendance_status = status;
        } else Toast.error(res.message);
    }

    async function cancel(id) {
        if (!confirm('Cancel this registration?')) return;
        const res = await API.cancelRegistration(id);
        if (res.success) {
            Toast.success('Registration cancelled.');
            allRegs = allRegs.filter(r => r.id != id);
            renderTable(allRegs);
        } else Toast.error(res.message);
    }

    async function init() {
        currentUser = await Auth.requireAuth();
        if (!currentUser) return;
        Sidebar.render(currentUser, 'registrations');

        const res = await API.getRegistrations();
        allRegs = res.data || [];

        // Populate event filter if admin/staff
        if (['admin', 'staff'].includes(currentUser.role) && document.getElementById('eventFilter')) {
            const eventNames = [...new Map(allRegs.map(r => [r.event_id, r.event_name])).entries()];
            eventNames.forEach(([id, name]) => {
                const opt = document.createElement('option');
                opt.value = id; opt.textContent = name;
                document.getElementById('eventFilter').appendChild(opt);
            });
        }

        renderTable(allRegs);
        document.getElementById('searchInput')?.addEventListener('input', filter);
        document.getElementById('eventFilter')?.addEventListener('change', filter);
    }

    return { init, markAttendance, cancel, filter };
})();

window.RegistrationsPage = RegistrationsPage;
document.addEventListener('DOMContentLoaded', () => RegistrationsPage.init());
