const BASE = '/api/auth';

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function logout() {
  await fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' });
}

export async function refreshToken() {
  const res = await fetch(`${BASE}/refresh`, { method: 'POST', credentials: 'include' });
  return res.ok;
}

export async function getMe() {
  const res = await fetch(`${BASE}/me`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function fetchAdminUsers() {
  const res = await fetch(`${BASE}/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
}

export async function createAdminUser(email, password) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create user');
  }
  return res.json();
}

export async function deleteAdminUser(id) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete user');
  }
  return res.json();
}
