const BASE = '/api';

export async function fetchQuestions() {
  const res = await fetch(`${BASE}/admin/questions`);
  return res.json();
}

export async function createQuestion(data) {
  const res = await fetch(`${BASE}/admin/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateQuestion(id, data) {
  const res = await fetch(`${BASE}/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteQuestion(id) {
  const res = await fetch(`${BASE}/admin/questions/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function reorderQuestions(order) {
  const res = await fetch(`${BASE}/admin/questions/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  return res.json();
}

export async function fetchResponses() {
  const res = await fetch(`${BASE}/admin/responses`);
  return res.json();
}
