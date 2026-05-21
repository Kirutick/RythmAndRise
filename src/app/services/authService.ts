export interface UserData {
  id?: string;
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

const API_BASE = '/api/auth';

/**
 * Build fetch options with credentials:'include' for cookies
 * AND an Authorization header with the localStorage token as fallback.
 */
function buildFetchOptions(extraHeaders?: Record<string, string>): RequestInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Attach Bearer token from localStorage as a fallback for cookies
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    headers,
    credentials: 'include', // still send cookies as primary auth
  };
}

export const AuthService = {
  async safeParseJSON(response: Response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response. Raw text:', text);
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        throw new Error(
          `Server returned HTML instead of JSON. Status: ${response.status}`
        );
      }
      throw new Error(
        `Invalid JSON response from server. Status: ${response.status}`
      );
    }
  },

  async handleResponse(response: Response) {
    let data: any = {};
    try {
      data = await this.safeParseJSON(response);
    } catch (parseError: any) {
      if (!response.ok)
        throw new Error(
          `Request failed with status ${response.status}. Could not parse error details.`
        );
      throw parseError;
    }
    if (!response.ok)
      throw new Error(
        data.message || data.error || `Request failed with status ${response.status}`
      );
    return data;
  },

  async signup(data: Omit<UserData, 'role'>) {
    const res = await fetch(`${API_BASE}/signup`, {
      ...buildFetchOptions(),
      method: 'POST',
      body: JSON.stringify(data),
    });
    const responseData = await this.handleResponse(res);
    if (responseData.token) {
      localStorage.setItem('token', responseData.token);
    }
    if (responseData.user) {
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    return responseData;
  },

  async login(email: string, password: string, role: 'user' | 'admin') {
    const res = await fetch(`${API_BASE}/login`, {
      ...buildFetchOptions(),
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    const data = await this.handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  getUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Clear local auth state only (no network request).
   * Use this when auth verification fails — avoids wasting another
   * round-trip to the server.
   */
  clearLocalAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  /**
   * Full logout: clears server cookie + local state.
   * Only makes a server request if a token actually exists.
   */
  async logout() {
    const hasToken = !!localStorage.getItem('token');
    // Always clear local state first
    this.clearLocalAuth();

    if (hasToken) {
      try {
        await fetch(`${API_BASE}/logout`, {
          ...buildFetchOptions(),
          method: 'POST',
        });
      } catch (e) {
        console.error('Logout request failed:', e);
      }
    }
  },

  /**
   * Verify the current session.
   * 
   * CRITICAL: If no token exists in localStorage, return null immediately
   * WITHOUT making a network request. This prevents:
   * - Wasted 1.6s serverless cold-start on unauthenticated page loads
   * - Console 401 errors on every app load
   * - Unnecessary rate limiter consumption
   */
  async verifyToken() {
    // Fast path: no token means no session — skip the network request entirely
    const token = localStorage.getItem('token');
    if (!token) {
      this.clearLocalAuth();
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/verify`, {
        ...buildFetchOptions(),
        method: 'GET',
      });

      if (res.status === 401) {
        this.clearLocalAuth();
        return null;
      }

      const data = await this.handleResponse(res);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.error('Session verification failed:', err);
      this.clearLocalAuth();
      return null;
    }
  },
};