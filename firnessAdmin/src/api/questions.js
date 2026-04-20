const BASE = '/api';

async function authFetch(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: 'include' });
  if (res.status === 401) {
    // Try refreshing token
    const refreshRes = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshRes.ok) {
      // Retry original request
      return fetch(url, { ...options, credentials: 'include' });
    }
    window.location.reload();
  }
  return res;
}

export async function fetchQuestions() {
  const res = await authFetch(`${BASE}/admin/questions`);
  return res.json();
}

export async function createQuestion(data) {
  const res = await authFetch(`${BASE}/admin/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateQuestion(id, data) {
  const res = await authFetch(`${BASE}/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteQuestion(id) {
  const res = await authFetch(`${BASE}/admin/questions/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function reorderQuestions(order) {
  const res = await authFetch(`${BASE}/admin/questions/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  return res.json();
}

export async function fetchResponses() {
  const res = await authFetch(`${BASE}/admin/responses`);
  return res.json();
}
