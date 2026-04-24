/**
 * EMS - Centralized API Helper
 * All fetch calls go through this module
 */

const BASE = '';  // Same-origin, Python Flask server

const API = {
  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`${BASE}${endpoint}`, options);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  // AUTH
  login: (body)    => API.request('/api/auth/login', 'POST', body),
  logout: ()       => API.request('/api/auth/logout', 'POST'),
  register: (body) => API.request('/api/auth/register', 'POST', body),
  session: ()      => API.request('/api/auth/session', 'GET'),

  // DASHBOARD
  dashboard: ()    => API.request('/api/dashboard', 'GET'),

  // DEPARTMENTS
  getDepartments:           ()     => API.request('/api/departments', 'GET'),
  createDepartment:         (body) => API.request('/api/departments', 'POST', body),
  updateDepartment:         (body) => API.request('/api/departments', 'PUT', body),
  deleteDepartment:         (id)   => API.request('/api/departments', 'DELETE', { id }),

  // USERS
  getUsers:    (params = '') => API.request('/api/users' + (params ? '?' + params : ''), 'GET'),
  createUser:  (body)        => API.request('/api/users', 'POST', body),
  updateUser:  (body)        => API.request('/api/users', 'PUT', body),
  deleteUser:  (id)          => API.request('/api/users', 'DELETE', { id }),

  // EVENTS
  getEvents:   (params = '') => API.request('/api/events' + (params ? '?' + params : ''), 'GET'),
  getEvent:    (id)          => API.request(`/api/events?id=${id}`, 'GET'),
  createEvent: (body)        => API.request('/api/events', 'POST', body),
  updateEvent: (body)        => API.request('/api/events', 'PUT', body),
  deleteEvent: (id)          => API.request('/api/events', 'DELETE', { id }),

  // REGISTRATIONS
  getRegistrations: (params = '') => API.request('/api/registrations' + (params ? '?' + params : ''), 'GET'),
  registerForEvent: (body)        => API.request('/api/registrations', 'POST', body),
  updateRegistration: (body)      => API.request('/api/registrations', 'PUT', body),
  cancelRegistration: (id)        => API.request('/api/registrations', 'DELETE', { id }),

  // REPORTS
  getReport: (type, params = '') => API.request(`/api/reports?type=${type}` + (params ? '&' + params : ''), 'GET'),
};

window.API = API;
