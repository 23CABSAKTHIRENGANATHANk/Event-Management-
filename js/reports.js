/**
 * EMS - Reports Page Module
 * Admin/Staff: event-wise, department-wise, attendance reports + CSV export
 */

const ReportsPage = (() => {
    let currentReport = 'event_wise';
    let currentData = [];

    const STATUS_BADGE = {
        upcoming: 'badge-blue', ongoing: 'badge-green',
        completed: 'badge-purple', cancelled: 'badge-red'
    };
    const ATT_BADGE = { present: 'badge-green', absent: 'badge-red', not_marked: 'badge-blue' };

    function fmt(d) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderEventWise(data) {
        const cont = document.getElementById('reportContent');
        if (!data.length) {
            cont.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div>No event data available</div>';
            return;
        }
        cont.innerHTML = `<div class="table-container"><table>
            <thead><tr>
                <th>Event</th><th>Date</th><th>Location</th><th>Status</th>
                <th>Registered</th><th>Attended</th><th>Capacity</th><th>Fill %</th>
            </tr></thead>
            <tbody>${data.map(r => `<tr>
                <td class="td-name">${r.event_name}</td>
                <td>${fmt(r.event_date)}</td>
                <td>${r.location || '—'}</td>
                <td><span class="badge ${STATUS_BADGE[r.status] || 'badge-blue'}">${r.status}</span></td>
                <td style="font-weight:600;">${r.total_registered}</td>
                <td><span class="badge badge-green">${r.attended}</span></td>
                <td style="color:var(--text-muted);">${r.capacity}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;min-width:60px;">
                            <div style="height:100%;background:linear-gradient(90deg,#4f8ef7,#a855f7);border-radius:3px;width:${Math.min(100, Math.round(r.total_registered / r.capacity * 100))}%;"></div>
                        </div>
                        <span style="font-size:12px;color:var(--text-muted);">${Math.min(100, Math.round(r.total_registered / r.capacity * 100))}%</span>
                    </div>
                </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }

    function renderDeptWise(data) {
        const cont = document.getElementById('reportContent');
        if (!data.length) {
            cont.innerHTML = '<div class="empty-state"><div class="empty-icon">📁</div>No department data</div>';
            return;
        }
        cont.innerHTML = `<div class="table-container"><table>
            <thead><tr>
                <th>Department</th><th>Total Events</th><th>Total Registrations</th><th>Total Students</th>
            </tr></thead>
            <tbody>${data.map(r => `<tr>
                <td class="td-name">${r.department_name}</td>
                <td style="font-weight:600;">${r.total_events}</td>
                <td><span class="badge badge-blue">${r.total_registrations}</span></td>
                <td><span class="badge badge-green">${r.total_students}</span></td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }

    function renderAttendance(data) {
        const cont = document.getElementById('reportContent');
        if (!data.length) {
            cont.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div>No attendance data</div>';
            return;
        }
        cont.innerHTML = `<div class="table-container"><table>
            <thead><tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Event</th>
                <th>Registration</th><th>Attendance</th><th>Date</th>
            </tr></thead>
            <tbody>${data.map(r => `<tr>
                <td class="td-name">${r.name}</td>
                <td style="color:var(--text-muted);font-size:13px;">${r.email}</td>
                <td><span class="badge badge-blue">${r.user_role}</span></td>
                <td>${r.event_name}</td>
                <td><span class="badge badge-green">${r.registration_status}</span></td>
                <td><span class="badge ${ATT_BADGE[r.attendance_status] || 'badge-blue'}">${r.attendance_status.replace('_', ' ')}</span></td>
                <td style="color:var(--text-muted);font-size:12px;">${fmt(r.created_at)}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }

    async function loadReport(type) {
        currentReport = type;
        // Update active tab
        document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-report="${type}"]`)?.classList.add('active');

        const cont = document.getElementById('reportContent');
        cont.innerHTML = '<div class="page-loader"><div class="loading-spinner"></div> Loading report…</div>';

        const res = await API.getReport(type);
        currentData = res.data || [];

        if (type === 'event_wise') renderEventWise(currentData);
        else if (type === 'department_wise') renderDeptWise(currentData);
        else if (type === 'attendance') renderAttendance(currentData);
    }

    function exportCSV() {
        if (!currentData.length) { Toast.error('No data to export.'); return; }
        const headers = Object.keys(currentData[0]);
        const rows = currentData.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ems_report_${currentReport}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        Toast.success('CSV exported!');
    }

    async function init() {
        const user = await Auth.requireAuth(['admin', 'staff']);
        if (!user) return;
        Sidebar.render(user, 'reports');

        // Wire report tab buttons
        document.querySelectorAll('.report-tab').forEach(btn => {
            btn.addEventListener('click', () => loadReport(btn.dataset.report));
        });

        // Wire export button
        document.getElementById('exportBtn')?.addEventListener('click', exportCSV);

        // Load default
        await loadReport('event_wise');
    }

    return { init, loadReport, exportCSV };
})();

window.ReportsPage = ReportsPage;
document.addEventListener('DOMContentLoaded', () => ReportsPage.init());
