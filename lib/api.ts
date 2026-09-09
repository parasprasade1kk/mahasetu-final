// ─── MahaSetu Centralized API Client ─────────────────────────────────────────
// Handles communication between Next.js frontend and Express/MongoDB backend.
// Supports both relative /api calls (via Next rewrites) and absolute NEXT_PUBLIC_API_URL.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const CITIZEN_TOKEN_KEY = 'mahasetu_token';
export const ADMIN_TOKEN_KEY = 'mahasetu_admin_token';

export function getCitizenToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CITIZEN_TOKEN_KEY);
}

export function setCitizenToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CITIZEN_TOKEN_KEY, token);
}

export function removeCitizenToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CITIZEN_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  useAdminAuth: boolean = false
): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = useAdminAuth ? getAdminToken() : getCitizenToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let friendlyError = data.error;
      if (!friendlyError) {
        if (res.status === 404) {
          friendlyError = `Admin API returned 404 (${cleanEndpoint}). Ensure the Express backend is running on port 5000.`;
        } else if (res.status === 401) {
          friendlyError = 'Invalid Administrator ID or password.';
        } else if (res.status === 403) {
          friendlyError = 'Access denied. Dedicated Government Administrator privilege required.';
        } else if (res.status === 500) {
          friendlyError = 'Admin API returned 500. Check server logs and MongoDB Atlas connection.';
        } else if (res.status === 502 || res.status === 503 || res.status === 504) {
          friendlyError = 'Backend unavailable. Please verify the Express server is running on port 5000.';
        } else {
          friendlyError = `Authentication error (HTTP ${res.status}).`;
        }
      }
      return {
        success: false,
        error: friendlyError,
        status: res.status,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Backend unavailable: Connection refused. Ensure the backend server is running on port 5000.',
    };
  }
}

// ─── Citizen Auth API ─────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (mobile: string, aadhaar?: string) =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, aadhaar }),
    }),

  register: (fullName: string, mobile: string, aadhaar?: string, otp: string = '123456') =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, mobile, aadhaar, otp }),
    }),

  login: (mobile: string, aadhaar?: string, otp: string = '123456') =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, aadhaar, otp }),
    }),

  getMe: () => apiRequest('/auth/me'),

  // Canonical Admin Auth: POST /api/admin/login
  adminLogin: (adminId: string, password: string) =>
    apiRequest(
      '/admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ adminId, password }),
      },
      false
    ),

  getAdminMe: () => apiRequest('/admin/me', {}, true),
};

// ─── Profile API ─────────────────────────────────────────────────────────────

export const profileApi = {
  getProfile: () => apiRequest('/profiles/me'),
  updateProfile: (profileData: any) =>
    apiRequest('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// ─── Schemes & Eligibility API ────────────────────────────────────────────────

export const schemeApi = {
  getAll: (query?: { department?: string; category?: string; search?: string }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/schemes?${params.toString()}`);
  },

  getById: (id: string) => apiRequest(`/schemes/${id}`),

  matchSchemes: (query: string) =>
    apiRequest('/schemes/match', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  evaluateEligibility: (profile?: any) =>
    apiRequest('/schemes/evaluate', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    }),
};

// ─── Applications API ─────────────────────────────────────────────────────────

export const applicationApi = {
  getMy: () => apiRequest('/applications/my'),
  submit: (applicationData: any) =>
    apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),
  getById: (id: string) => apiRequest(`/applications/${id}`),
};

// ─── Documents API ────────────────────────────────────────────────────────────

export const documentApi = {
  getMy: () => apiRequest('/documents/my'),
  upload: (data: { documentName: string; documentType: string; fileName?: string; fileSize?: string }) =>
    apiRequest('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  syncDigiLocker: () =>
    apiRequest('/documents/sync-digilocker', {
      method: 'POST',
    }),
};

// ─── Consents API ─────────────────────────────────────────────────────────────

export const consentApi = {
  getMy: () => apiRequest('/consents/my'),
  toggle: (id: string) =>
    apiRequest(`/consents/toggle/${id}`, {
      method: 'POST',
    }),
};

// ─── DigiLocker API ───────────────────────────────────────────────────────────

export const digiLockerApi = {
  getStatus: () => apiRequest('/digilocker/status'),
  link: (securityPin: string) =>
    apiRequest('/digilocker/link', {
      method: 'POST',
      body: JSON.stringify({ securityPin }),
    }),
  unlink: () =>
    apiRequest('/digilocker/unlink', {
      method: 'POST',
    }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getAnalytics: () => apiRequest('/admin/analytics', {}, true),

  getUsers: (query?: { search?: string; district?: string; category?: string; page?: number }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/users?${params.toString()}`, {}, true);
  },

  getUserDetail: (userId: string) => apiRequest(`/admin/users/${userId}`, {}, true),

  getApplications: (query?: { status?: string; department?: string; type?: string; search?: string }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/applications?${params.toString()}`, {}, true);
  },

  updateApplicationStatus: (id: string, status: string, remarks?: string) =>
    apiRequest(
      `/admin/applications/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, remarks }),
      },
      true
    ),

  getSchemes: (query?: { department?: string; active?: string; search?: string }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/schemes?${params.toString()}`, {}, true);
  },

  createScheme: (data: any) =>
    apiRequest(
      '/admin/schemes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ),

  updateScheme: (id: string, data: any) =>
    apiRequest(
      `/admin/schemes/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    ),

  deleteScheme: (id: string) =>
    apiRequest(
      `/admin/schemes/${id}`,
      {
        method: 'DELETE',
      },
      true
    ),

  getDocuments: (query?: { source?: string; verificationStatus?: string }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/documents?${params.toString()}`, {}, true);
  },

  getConsents: (query?: { status?: string }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/consents?${params.toString()}`, {}, true);
  },

  getAuditLogs: (query?: { action?: string; actorRole?: string; limit?: number }) => {
    const params = new URLSearchParams(query as any);
    return apiRequest(`/admin/audit-logs?${params.toString()}`, {}, true);
  },

  broadcastNotification: (data: {
    title: string;
    titleMr?: string;
    message: string;
    messageMr?: string;
    type?: string;
    targetUserId?: string;
  }) =>
    apiRequest(
      '/admin/notifications/broadcast',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ),
};
