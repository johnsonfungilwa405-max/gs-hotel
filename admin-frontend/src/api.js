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
    // Token missing/expired - clear it and force back to login
    localStorage.removeItem('gs_staff_token');
    localStorage.removeItem('gs_staff_account');
    window.location.href = '/login';
    throw new Error('Session expired, please log in again');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  requestPasswordReset: (email) =>
    request('/auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) }),
  confirmPasswordReset: (email, code, new_password) =>
    request('/auth/confirm-reset', { method: 'POST', body: JSON.stringify({ email, code, new_password }) }),
  changePassword: (current_password, new_password) =>
    request('/auth/change-password', { method: 'PATCH', body: JSON.stringify({ current_password, new_password }) }),

  // Rooms
  getRooms: () => request('/admin/rooms'),
  addRoom: (payload) => request('/admin/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  proposeRoomPrice: (id, price) =>
    request(`/admin/rooms/${id}/price`, { method: 'PATCH', body: JSON.stringify({ price }) }),
  updateRoom: (id, payload) => request(`/admin/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  removeRoom: (id) => request(`/admin/rooms/${id}`, { method: 'DELETE' }),

  getInHouseCustomers: () => request('/admin/customers'),
  getAllCustomers: () => request('/customers'),

  getOrders: () => request('/orders'),
  payOrder: (id) => request(`/orders/${id}/pay`, { method: 'PATCH' }),
  completeOrder: (id) => request(`/orders/${id}/complete`, { method: 'PATCH' }),

  getServices: () => request('/services'),

  getFeedback: () => request('/feedback'),
  respondFeedback: (id, admin_response) =>
    request(`/feedback/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ admin_response }) }),

  getNews: () => request('/news'),
  postNews: (payload) => request('/news', { method: 'POST', body: JSON.stringify(payload) }),
};
