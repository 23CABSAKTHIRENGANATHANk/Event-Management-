/**
 * EMS - Events Page Module
 * Handles: listing, filtering, adding, editing, deleting events
 */

const EventsPage = (() => {
    let allEvents = [];
    let currentUser = null;
    let canEdit = false;

    const STATUS_BADGE = {
        upcoming: 'badge-blue', ongoing: 'badge-green',
        completed: 'badge-purple', cancelled: 'badge-red'
    };

    function fmt(d) {
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderTable(events) {
        const tb = document.getElementById('eventsTable');
        if (!events.length) {
            tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div>No events found</div></td></tr>';
            return;
        }
        tb.innerHTML = events.map(e => `<tr>
            <td class="td-name">${e.event_name}</td>
            <td>${fmt(e.event_date)}</td>
            <td>${e.location || '—'}</td>
            <td>${e.department_name || '—'}</td>
            <td>${e.registered_count || 0}/${e.capacity}</td>
            <td><span class="badge ${STATUS_BADGE[e.status] || 'badge-blue'}">${e.status}</span></td>
            <td>${canEdit ? `<div class="td-actions">
                <button class="btn btn-secondary btn-sm btn-icon" onclick="EventsPage.edit('${e.id}')" title="Edit">✏️</button>
                <button class="btn btn-danger btn-sm btn-icon" onclick="EventsPage.remove('${e.id}')" title="Delete">🗑️</button>
            </div>` : '<span style="color:var(--text-muted);font-size:12px;">—</span>'}</td>
        </tr>`).join('');
    }

    function filter() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const s = document.getElementById('statusFilter')?.value || '';
        renderTable(allEvents.filter(e =>
            (!q || e.event_name.toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q)) &&
            (!s || e.status === s)
        ));
    }

    function openModal(reset = true) {
        if (reset) {
            document.getElementById('modalTitle').textContent = 'Add Event';
            document.getElementById('eventId').value = '';
            ['eventName', 'eventDesc', 'eventLocation'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('eventDate').value = '';
            document.getElementById('eventDeadline').value = '';
            document.getElementById('eventCapacity').value = 100;
            document.getElementById('eventStatus').value = 'upcoming';
            document.getElementById('eventDept').value = '';
            document.getElementById('eventStaff').value = '';
        }
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

    function edit(id) {
        const e = allEvents.find(x => x.id == id);
        if (!e) return;
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventId').value = e.id;
        document.getElementById('eventName').value = e.event_name;
        document.getElementById('eventDesc').value = e.description || '';
        document.getElementById('eventDate').value = e.event_date;
        document.getElementById('eventDeadline').value = e.registration_deadline || '';
        document.getElementById('eventLocation').value = e.location || '';
        document.getElementById('eventDept').value = e.department_id || '';
        document.getElementById('eventStaff').value = e.staff_id || '';
        document.getElementById('eventCapacity').value = e.capacity || 100;
        document.getElementById('eventStatus').value = e.status || 'upcoming';
        openModal(false);
    }

    async function save(e) {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        btn.innerHTML = '<span class="loading-spinner"></span>'; btn.disabled = true;
        const id = document.getElementById('eventId').value;
        const body = {
            event_name: document.getElementById('eventName').value,
            description: document.getElementById('eventDesc').value,
            event_date: document.getElementById('eventDate').value,
            registration_deadline: document.getElementById('eventDeadline').value || null,
            location: document.getElementById('eventLocation').value,
            department_id: document.getElementById('eventDept').value || null,
            staff_id: document.getElementById('eventStaff').value || null,
            capacity: parseInt(document.getElementById('eventCapacity').value) || 100,
            status: document.getElementById('eventStatus').value,
        };
        if (id) body.id = id;
        const res = id ? await API.updateEvent(body) : await API.createEvent(body);
        if (res.success) {
            Toast.success(res.message);
            closeModal();
            const fresh = await API.getEvents();
            allEvents = fresh.data || [];
            renderTable(allEvents);
        } else Toast.error(res.message);
        btn.innerHTML = 'Save Event'; btn.disabled = false;
    }

    async function remove(id) {
        if (!confirm('Delete this event? All registrations will be removed.')) return;
        const res = await API.deleteEvent(id);
        if (res.success) {
            Toast.success('Event deleted.');
            allEvents = allEvents.filter(e => e.id != id);
            renderTable(allEvents);
        } else Toast.error(res.message);
    }

    async function init() {
        currentUser = await Auth.requireAuth();
        if (!currentUser) return;
        Sidebar.render(currentUser, 'events');
        canEdit = ['admin', 'staff'].includes(currentUser.role);

        if (canEdit && document.getElementById('addEventBtn'))
            document.getElementById('addEventBtn').style.display = '';
        if (!canEdit && document.getElementById('actionsHead'))
            document.getElementById('actionsHead').style.display = 'none';

        const [evRes, deptRes, staffRes] = await Promise.all([
            API.getEvents(), API.getDepartments(), API.getUsers('role=staff')
        ]);
        allEvents = evRes.data || [];

        if (deptRes.data) deptRes.data.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id; opt.textContent = d.department_name;
            document.getElementById('eventDept')?.appendChild(opt);
        });
        if (staffRes.data) staffRes.data.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id; opt.textContent = s.name;
            document.getElementById('eventStaff')?.appendChild(opt);
        });

        renderTable(allEvents);

        // Wire up event listeners
        document.getElementById('searchInput')?.addEventListener('input', filter);
        document.getElementById('statusFilter')?.addEventListener('change', filter);
    }

    return { init, edit, remove, save, openModal, closeModal };
})();

window.EventsPage = EventsPage;
document.addEventListener('DOMContentLoaded', () => EventsPage.init());
