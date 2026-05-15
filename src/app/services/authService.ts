

export interface UserData {
  id?: string;
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

const API_BASE = '/api/auth';

export const AuthService = {
  // Helper to safely parse JSON or return empty object
  async safeParseJSON(response: Response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response. Raw text:', text);
      // If it's not JSON, it might be an HTML error page from Vite/Express
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        throw new Error(`Server returned an HTML error instead of JSON. Status: ${response.status}`);
      }
      throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
    }
  },

  // Helper to handle response status
  async handleResponse(response: Response) {
    let data: any = {};
    try {
      data = await this.safeParseJSON(response);
    } catch (parseError: any) {
      // If parsing fails, we still want to throw if the response wasn't OK
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}. Could not parse error details.`);
      }
      throw parseError;
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }
    return data;
  },

  // Step 1: Credentials submission (starts OTP process)
  async signupStep1(data: Omit<UserData, 'role'>) {
    const res = await fetch(`${API_BASE}/signup/step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async loginStep1(email: string, password: string, role: 'user' | 'admin') {
    const res = await fetch(`${API_BASE}/login/step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return this.handleResponse(res);
  },

  // Step 2: OTP Verification
  async signupStep2(data: Omit<UserData, 'role'>, otp: string, verificationId: string) {
    const res = await fetch(`${API_BASE}/signup/step2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, otp, verificationId }),
    });
    return this.handleResponse(res);
  },

  async loginStep2(email: string, otp: string, verificationId: string, role: 'user' | 'admin') {
    const res = await fetch(`${API_BASE}/login/step2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, verificationId, role }),
    });
    return this.handleResponse(res);
  },

  async resendOTP(verificationId: string) {
    const res = await fetch(`${API_BASE}/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId }),
    });
    return this.handleResponse(res);
  }
};
