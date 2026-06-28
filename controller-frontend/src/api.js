const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('gs_staff_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));

    if (token) {
      // We had a token and it was rejected - the session really did expire.
      localStorage.removeItem('gs_staff_token');
      localStorage.removeItem('gs_staff_account');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired, please log in again');
    }

    // No token was sent (e.g. a login attempt) - this is just a normal
    // "not authorized" response, not a session expiry.
    throw new Error(body.error || 'Invalid username or password');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  checkSetupStatus: () => request('/auth/setup-status'),
  bootstrapController: (payload) =>
    request('/auth/bootstrap-controller', { method: 'POST', body: JSON.stringify(payload) }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  requestPasswordReset: (email) =>
    request('/auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) }),
  confirmPasswordReset: (email, code, new_password) =>
    request('/auth/confirm-reset', { method: 'POST', body: JSON.stringify({ email, code, new_password }) }),
  changePassword: (current_password, new_password) =>
    request('/auth/change-password', { method: 'PATCH', body: JSON.stringify({ current_password, new_password }) }),

  // Manage admin accounts (controller only)
  getAdmins: () => request('/auth/admins'),
  createAdmin: (payload) => request('/auth/admins', { method: 'POST', body: JSON.stringify(payload) }),
  removeAdmin: (id) => request(`/auth/admins/${id}`, { method: 'DELETE' }),

  // Approvals & reports
  getApprovals: (status = 'pending') => request(`/controller/approvals?status=${status}`),
  approve: (id) => request(`/controller/approvals/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/controller/approvals/${id}/reject`, { method: 'PATCH' }),

  getRoomsOverview: () => request('/controller/rooms-overview'),
  getProfit: () => request('/controller/profit'),
  getTraffic: () => request('/controller/traffic'),
  getFeedback: () => request('/controller/feedback'),
};
