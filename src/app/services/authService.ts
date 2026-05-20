export interface UserData {
  id?: string;
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

const API_BASE = 'https://rythmandrise-backend-production.up.railway.app';
const fetchOptions: RequestInit = {
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Send secure HttpOnly cookies
};

export const AuthService = {
  async safeParseJSON(response: Response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response. Raw text:', text);
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        throw new Error(`Server returned an HTML error instead of JSON. Status: ${response.status}`);
      }
      throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
    }
  },

  async handleResponse(response: Response) {
    let data: any = {};
    try {
      data = await this.safeParseJSON(response);
    } catch (parseError: any) {
      if (!response.ok) throw new Error(`Request failed with status ${response.status}. Could not parse error details.`);
      throw parseError;
    }
    if (!response.ok) throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    return data;
  },

  async signup(data: Omit<UserData, 'role'>) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      ...fetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    const responseData = await this.handleResponse(res);
    if (responseData.user) {
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    return responseData;
  },

  async login(email: string, password: string, role: 'user' | 'admin') {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      ...fetchOptions,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, password, role }),
    });

    const data = await this.handleResponse(res);
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

  async logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { ...fetchOptions, method: 'POST',credentials: 'include',});
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      localStorage.removeItem('user');
    }
  },

async verifyToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      ...fetchOptions,
      credentials: 'include',
      method: 'GET',
    });

    if (res.status === 401) {
      localStorage.removeItem('user');
      return null;
    }

    const data = await this.handleResponse(res);

    if (data.user) {
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    }

    return data;

  } catch (err) {
    console.error(err);
    return null;
  }
}
    // User not logged in yet
    if (res.status === 401) {
      localStorage.removeItem('user');
      return null;
    }

    const data = await this.handleResponse(res);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;

  } catch (err) {
    console.error('Verify token error:', err);
    return null;
  }
}
};
