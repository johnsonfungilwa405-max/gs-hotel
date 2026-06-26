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
  getRooms: () => request('/rooms'),
  getRoom: (id) => request(`/rooms/${id}`),
  likeRoom: (id) => request(`/rooms/${id}/like`, { method: 'POST' }),

  getServices: (category) => request(`/services${category ? `?category=${category}` : ''}`),
  likeService: (id) => request(`/services/${id}/like`, { method: 'POST' }),
  orderService: (id, payload) => request(`/services/${id}/order`, { method: 'POST', body: JSON.stringify(payload) }),

  identifyCustomer: (payload) => request('/customers/identify', { method: 'POST', body: JSON.stringify(payload) }),
  registerCustomer: (payload) => request('/customers/register', { method: 'POST', body: JSON.stringify(payload) }),

  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  getNews: () => request('/news'),
  submitFeedback: (payload) => request('/feedback', { method: 'POST', body: JSON.stringify(payload) }),
};
