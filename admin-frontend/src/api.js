const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
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
