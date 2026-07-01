const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('taskflow_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
};

export const boardsApi = {
  list: () => request('/boards'),
  create: (payload) => request('/boards', { method: 'POST', body: payload }),
  get: (id) => request(`/boards/${id}`),
  update: (id, payload) => request(`/boards/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => request(`/boards/${id}`, { method: 'DELETE' }),
};

export const tasksApi = {
  create: (payload) => request('/tasks', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  reorder: (tasks) => request('/tasks/reorder/bulk', { method: 'PUT', body: { tasks } }),
};

export { getToken };
