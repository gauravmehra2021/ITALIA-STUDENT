export type UserRole = 'User' | 'Mentor' | 'Admin' | 'SuperAdmin' | 'Staff';

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  accountStatus?: number | string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  preferredLanguage?: number | string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: User;
  requiresOtp: boolean;
  pendingUserId?: string | null;
  demoOtpHint?: string | null;
  isDemonstrationOnly: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: number;
  status: number;
  capacity: number;
  enrolledCount: number;
  mentorId?: string | null;
  mentorName?: string | null;
  language: string;
  price: number;
  currency: string;
  thumbnailUrl?: string | null;
  paymentUrl?: string | null;
  durationWeeks: number;
  createdAtUtc: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: number; // 1 = Video, 2 = Audio, 0 = PDF, 3 = Worksheet/Task
  sortOrder: number;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  contentText?: string | null;
  practicalTask?: string | null;
  durationMinutes?: number;
  chapterTitle?: string | null;
  chapterNumber?: number;
}

export interface ClassSession {
  id: string;
  courseId: string;
  courseTitle: string;
  mentorId: string;
  mentorName: string;
  scheduledAtUtc: string;
  durationMinutes: number;
  status: number;
  meetingUrl?: string | null;
  summaryNotes?: string | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle?: string;
  chapterTitle?: string;
  title: string;
  description: string;
  referenceFileUrl?: string | null;
  totalMarks: number;
  dueDateUtc?: string | null;
  createdAtUtc: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissionText: string;
  fileAttachmentUrl?: string | null;
  marksObtained?: number | null;
  teacherFeedback?: string | null;
  gradedAtUtc?: string | null;
  submittedAtUtc: string;
}

export interface AiResponse {
  prompt: string;
  response: string;
  mode: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  timestampUtc: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: number;
  createdAtUtc: string;
  isRead: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function levelLabel(l: number): string {
  switch (l) {
    case 0: return 'Beginner (A1-A2)';
    case 1: return 'Intermediate (B1-B2)';
    case 2: return 'Advanced (C1-C2)';
    default: return 'All Levels';
  }
}

