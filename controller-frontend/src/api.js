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
  getApprovals: (status = 'pending') => request(`/controller/approvals?status=${status}`),
  approve: (id) => request(`/controller/approvals/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/controller/approvals/${id}/reject`, { method: 'PATCH' }),

  getRoomsOverview: () => request('/controller/rooms-overview'),
  getProfit: () => request('/controller/profit'),
  getTraffic: () => request('/controller/traffic'),
  getFeedback: () => request('/controller/feedback'),
};
