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

  async signupStep1(data: Omit<UserData, 'role'>) {
    const res = await fetch(`${API_BASE}/api/auth/signup/step1`, {
      ...fetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

async loginStep1(email: string, password: string, role: 'user' | 'admin') {
  const res = await fetch(`${API_BASE}/api/auth/login/step1`, {
    ...fetchOptions,
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password, role }),
  });

  return this.handleResponse(res);
},

  async signupStep2(data: Omit<UserData, 'role'>, otp: string, verificationId: string) {
    const res = await fetch(`${API_BASE}/api/auth/signup/step2`, {
      ...fetchOptions,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ ...data, otp, verificationId }),
    });
    return this.handleResponse(res);
  },

  async loginStep2(email: string, otp: string, verificationId: string, role: 'user' | 'admin') {
    const res = await fetch(`${API_BASE}/api/auth/login/step2`, {
      ...fetchOptions,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, otp, verificationId, role }),
    });
    const data = await this.handleResponse(res);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async resendOTP(verificationId: string) {
    const res = await fetch(`${API_BASE}/api/auth/otp/resend`, {
      ...fetchOptions,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ verificationId }),
    });
    return this.handleResponse(res);
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
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      ...fetchOptions,
      credentials: 'include',
      method: 'GET',
    });
    const data = await this.handleResponse(res);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }
};
