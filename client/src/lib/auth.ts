type HttpMethod = 'GET' | 'POST';

interface FetchError extends Error {
  status?: number;
  response?: unknown;
}

export type RegisterData = {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'client' | 'psychologist' | 'admin' | string;
};

const PHP_AUTH_ENDPOINT = '/api/auth.php';
const NODE_AUTH_ENDPOINT = '/api/auth';

function buildInit(method: HttpMethod, payload?: unknown): RequestInit {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers
  };

  if (method !== 'GET' && payload !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(payload);
  }

  return init;
}

async function fetchJson(url: string, init: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type') ?? '';

  let parsed: any = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      if (contentType.includes('application/json')) {
        parsed = JSON.parse(text);
      } else {
        try {
          parsed = JSON.parse(text);
        } catch (error) {
          parsed = text;
        }
      }
    }
  }

  if (!response.ok) {
    const message = (parsed && (parsed.error || parsed.message)) || response.statusText || 'Request failed';
    const error: FetchError = new Error(message);
    error.status = response.status;
    error.response = parsed;
    throw error;
  }

  return parsed;
}

function shouldFallback(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof TypeError) {
    return true;
  }

  const err = error as FetchError;
  if (err.status === 0 || err.status === 404 || err.status === 405) {
    return true;
  }

  if (typeof err.message === 'string' && err.message.includes('Failed to fetch')) {
    return true;
  }

  return false;
}

function phpRegisterPayload(data: RegisterData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    email: data.email,
    password: data.password
  };

  const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
  if (name) {
    payload.name = name;
  }

  const role = data.role === 'client' ? 'user' : data.role;
  if (role) {
    payload.role = role;
  }

  return payload;
}

function nodeRegisterPayload(data: RegisterData): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...data };

  if (!payload.firstName && data.name) {
    const parts = data.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length) {
      payload.firstName = parts.shift();
      payload.lastName = parts.join(' ');
    }
  }

  if (payload.role === 'user') {
    payload.role = 'client';
  }

  return payload;
}

async function phpAuth(action: string, method: HttpMethod, payload?: unknown) {
  const url = `${PHP_AUTH_ENDPOINT}?action=${action}`;
  return fetchJson(url, buildInit(method, payload));
}

async function nodeAuth(path: string, method: HttpMethod, payload?: unknown) {
  const url = `${NODE_AUTH_ENDPOINT}${path}`;
  return fetchJson(url, buildInit(method, payload));
}

export async function login(email: string, password: string) {
  try {
    return await phpAuth('login', 'POST', { email, password });
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
    return nodeAuth('/login', 'POST', { email, password });
  }
}

export async function me() {
  try {
    return await phpAuth('me', 'GET');
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
    return nodeAuth('/me', 'GET');
  }
}

export async function logout() {
  try {
    return await phpAuth('logout', 'POST');
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
    return nodeAuth('/logout', 'POST');
  }
}

export async function register(data: RegisterData) {
  try {
    return await phpAuth('register', 'POST', phpRegisterPayload(data));
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
    return nodeAuth('/register', 'POST', nodeRegisterPayload(data));
  }
}

