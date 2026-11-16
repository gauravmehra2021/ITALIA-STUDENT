import type {
  AiResponse,
  Assignment,
  AssignmentSubmission,
  AuthResponse,
  ClassSession,
  Course,
  Material,
  NotificationItem,
  PagedResult,
  User,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5057';

export const TOKEN_STORAGE_KEY = 'sseuropa_student_token';
export const USER_STORAGE_KEY = 'sseuropa_student_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredAuth();
    }
    const message = (typeof payload === 'object' && payload && 'message' in payload)
      ? (payload as { message?: string }).message
      : (typeof payload === 'string' ? payload : 'Request failed');
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  if (typeof payload === 'object' && payload && 'success' in payload) {
    const apiRes = payload as ApiResponse<T>;
    return apiRes.data;
  }

  return payload as T;
}

export const authApi = {
  login: (email: string, password: string, deviceId = 'student-web-portal', deviceName = 'Web Browser') =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceId, deviceName }),
    }),

  register: (payload: { email: string; password: string; fullName: string; preferredLanguage?: number }) =>
    request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyOtp: (pendingUserId: string, otpCode: string, deviceId = 'student-web-portal', deviceName = 'Web Browser') =>
    request<AuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ pendingUserId, otpCode, deviceId, deviceName }),
    }),

  forgotPassword: (email: string) =>
    request<{ challengeId: string; expiresAt: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { challengeId: string; code: string; newPassword: string }) =>
    request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<void>('/api/auth/logout', { method: 'POST' }).finally(() => {
      clearStoredAuth();
    }),
};

export const coursesApi = {
  list: (params: { search?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    q.set('page', String(params.page ?? 1));
    q.set('pageSize', String(params.pageSize ?? 50));
    if (params.search) q.set('search', params.search);
    return request<PagedResult<Course>>(`/api/courses?${q}`);
  },

  get: (id: string) => request<Course>(`/api/courses/${id}`),

  enroll: (id: string) => request<void>(`/api/courses/${id}/enroll`, { method: 'POST' }),
};

export const materialsApi = {
  byCourse: (courseId: string) => request<Material[]>(`/api/materials/course/${courseId}`),
};

export const classesApi = {
  list: () => request<ClassSession[]>('/api/classes'),
  meeting: (id: string) => request<ClassSession>(`/api/classes/${id}/meeting`),
};

export const assignmentsApi = {
  byCourse: (courseId: string) => request<Assignment[]>(`/api/assignments/course/${courseId}`),
  submit: (assignmentId: string, payload: { submissionText: string; fileAttachmentUrl?: string | null }) =>
    request<AssignmentSubmission>(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  mySubmissions: () => request<AssignmentSubmission[]>('/api/assignments/my-submissions'),
};

export const aiApi = {
  ask: (mode: string, prompt: string, sourceLanguage = 'English', targetLanguage = 'Italian') =>
    request<AiResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ mode, prompt, sourceLanguage, targetLanguage }),
    }),
  history: () => request<AiResponse[]>('/api/ai/history'),
};

export const notificationsApi = {
  list: () => request<NotificationItem[]>('/api/notifications/mine'),
  markRead: (id: string) => request<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};

