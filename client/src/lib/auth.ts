export async function login(email: string, password: string) {
  const res = await fetch('/api/auth.php?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function me() {
  const res = await fetch('/api/auth.php?action=me', { credentials: 'include' });
  return res.json();
}

export async function logout() {
  const res = await fetch('/api/auth.php?action=logout', {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

export async function register(data: { email: string; password: string; name: string; role?: 'user' | 'psychologist' }) {
  const res = await fetch('/api/auth.php?action=register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return res.json();
}
