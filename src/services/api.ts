import type {
  AiResponse,
  Announcement,
  AuthResponse,
  ClassSession,
  CourseCard,
  CourseOutline,
  LearnerSummary,
  Lesson,
  LessonResult,
  NotificationItem,
  User,
} from '../types';

// Live builds must never fall back to a local address (that breaks sign-in for every visitor).
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? 'https://api.sseuropa.com' : 'http://localhost:5080');

export const TOKEN_STORAGE_KEY = 'sseuropa_student_token';
export const USER_STORAGE_KEY = 'sseuropa_student_user';
const DEVICE_KEY = 'sseuropa_student_device';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — keep the session in memory only */
  }
}

export const getStoredToken = () => safeGet(TOKEN_STORAGE_KEY);

export function getStoredUser(): User | null {
  const raw = safeGet(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  safeSet(TOKEN_STORAGE_KEY, token);
  safeSet(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  safeSet(TOKEN_STORAGE_KEY, null);
  safeSet(USER_STORAGE_KEY, null);
}

function deviceId(): string {
  let id = safeGet(DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `web-${Date.now()}`;
    safeSet(DEVICE_KEY, id);
  }
  return id;
}

const deviceName = () => `Student web · ${navigator.userAgent.slice(0, 60)}`;

/** Fired when the session expires so the app can return to the login page. */
export const SESSION_EXPIRED_EVENT = 'sseuropa:session-expired';

/** Messages for errors that happen before the server answers (set by the language provider). */
const messages = {
  network: 'Cannot reach the server. Check your internet connection and try again.',
};
export function setApiMessages(m: Partial<typeof messages>) {
  Object.assign(messages, m);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(messages.network, 0);
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearStoredAuth();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const p = payload as { message?: string; title?: string; errors?: Record<string, string[]> } | string;
    let message = typeof p === 'string' ? p : p?.message || p?.title || '';
    if (typeof p === 'object' && p?.errors) {
      const first = Object.values(p.errors).flat()[0];
      if (first) message = first;
    }
    if (!message) message = res.status === 403 ? 'You don\'t have access to this.' : `Something went wrong (${res.status}).`;
    throw new ApiError(message, res.status);
  }

  if (payload && typeof payload === 'object' && 'success' in payload) return (payload as unknown as { data: T }).data;
  return payload as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

const put = <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) });

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse>('/api/auth/login', { email, password, deviceId: deviceId(), deviceName: deviceName() }),
  register: (payload: { email: string; password: string; firstName: string; lastName: string; preferredLanguage?: string }) =>
    post<User>('/api/auth/register', { ...payload, preferredLanguage: payload.preferredLanguage ?? 'English' }),
  verifyOtp: (userId: string, code: string) =>
    post<AuthResponse>('/api/auth/verify-otp', { userId, code, deviceId: deviceId(), deviceName: deviceName() }),
  forgotPassword: (email: string) => post<{ challengeId: string; expiresAt: string }>('/api/auth/forgot-password', { email }),
  resetPassword: (payload: { challengeId: string; code: string; newPassword: string }) =>
    post<void>('/api/auth/reset-password', payload),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<User>('/api/auth/change-password', { currentPassword, newPassword }),
  logout: () => post<void>('/api/auth/logout').finally(clearStoredAuth),
};

// ── Learning ────────────────────────────────────────────────────────────────

export const learnApi = {
  me: () => request<LearnerSummary>('/api/learn/me'),
  /** Saves the portal language on the profile: 'English' | 'Punjabi' | 'Hindi' | 'Urdu'. */
  setLanguage: (language: string) => put<string>('/api/learn/me/language', { language }),
  /** Punjabi / Hindi / Urdu translations of English content texts: { text: translation }. */
  translations: (language: string, texts: string[]) =>
    post<Record<string, string>>('/api/learn/translations', { language, texts }),
  courses: () => request<CourseCard[]>('/api/learn/courses'),
  course: (id: string) => request<CourseOutline>(`/api/learn/courses/${id}`),
  enroll: (id: string) => post<CourseOutline>(`/api/learn/courses/${id}/enroll`),
  lesson: (id: string) => request<Lesson>(`/api/learn/lessons/${id}`),
  complete: (id: string, scorePercent: number, correctAnswers: number, totalQuestions: number) =>
    post<LessonResult>(`/api/learn/lessons/${id}/complete`, { scorePercent, correctAnswers, totalQuestions }),
};

// ── Live classes, notifications, AI ─────────────────────────────────────────

export const classesApi = {
  list: () => request<ClassSession[]>('/api/classes'),
  meeting: (id: string) => request<ClassSession>(`/api/classes/${id}/meeting`),
};

export const notificationsApi = {
  list: () => request<NotificationItem[]>('/api/notifications'),
  markRead: (id: string) => post<void>(`/api/notifications/${id}/read`),
};

export const announcementsApi = {
  list: () => request<Announcement[]>('/api/announcements'),
};

export const aiApi = {
  ask: (mode: 'tutor' | 'translator' | 'conversation' | 'practice', prompt: string, sourceLanguage = 'English') =>
    post<AiResponse>('/api/ai', { mode, prompt, sourceLanguage, targetLanguage: 'Italian' }),
};
