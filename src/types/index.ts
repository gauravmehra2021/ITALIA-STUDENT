export type UserRole = 'User' | 'Mentor' | 'Admin' | 'SuperAdmin' | 'Staff';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: string;
  preferredLanguage: string;
  emailVerified: boolean;
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

// ── Courses & curriculum ────────────────────────────────────────────────────

export type LessonKind = 'Vocabulary' | 'Dialogue' | 'Grammar' | 'Review' | 'Video' | 'Exam' | 'Conversation';
export type BlockType = 'Text' | 'Vocabulary' | 'Dialogue' | 'Video' | 'Audio' | 'Image' | 'Pdf' | 'Tip' | 'Table' | 'Roleplay';
export type ExerciseType = 'ListenPick' | 'PickTranslation' | 'PickWord' | 'MatchPairs' | 'FillBlank' | 'WordOrder' | 'TrueFalse';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  enrolledCount: number;
  mentorName?: string | null;
  thumbnailUrl?: string | null;
  durationWeeks: number;
  slug?: string | null;
  shortDescription?: string | null;
  objectives?: string | null;
  modulesCount: number;
  lessonsCount: number;
  cefrLevel: string;
  category: string;
}

export interface CourseCard {
  course: Course;
  isEnrolled: boolean;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLessonId?: string | null;
  nextLessonTitle?: string | null;
}

export interface LessonSummary {
  id: string;
  unitId: string;
  order: number;
  title: string;
  titleIt: string;
  kind: LessonKind;
  summary: string;
  estimatedMinutes: number;
  xpReward: number;
  isFreePreview: boolean;
  vocabularyCount: number;
  exerciseCount: number;
  hasVideo: boolean;
  hasAudio: boolean;
  hasPdf: boolean;
  completed?: boolean | null;
  stars?: number | null;
  bestScorePercent?: number | null;
  locked?: boolean | null;
}

export interface Unit {
  id: string;
  courseId: string;
  order: number;
  title: string;
  titleIt: string;
  description: string;
  canDo: string[];
  imageUrl?: string | null;
  pdfUrl?: string | null;
  liveClassFocus?: string | null;
  lessons: LessonSummary[];
  completedLessons: number;
  stars: number;
}

export interface CourseOutline {
  course: Course;
  units: Unit[];
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  stars: number;
  maxStars: number;
  xpEarned: number;
  isEnrolled: boolean;
  nextLessonId?: string | null;
}

export interface VocabularyItem {
  id: string;
  italian: string;
  english: string;
  /** Punjabi meaning (romanised), when the lesson has one. */
  punjabi?: string | null;
  pronunciation?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  example?: string | null;
  exampleEnglish?: string | null;
}

export interface DialogueLine {
  speaker: string;
  italian: string;
  english: string;
  punjabi?: string | null;
  audioUrl?: string | null;
  /** Role-play: the learner's turn. */
  isLearner?: boolean;
  /** Role-play: other accepted answers for this turn. */
  replies?: { italian: string; english: string }[];
}

export interface LessonBlock {
  id: string;
  type: BlockType;
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  caption?: string | null;
  items: VocabularyItem[];
  lines: DialogueLine[];
  table: string[][];
}

export interface ExerciseOption {
  text: string;
  imageUrl?: string | null;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  italian?: string | null;
  imageUrl?: string | null;
  options: ExerciseOption[];
  correctIndex: number;
  answer?: string | null;
  pairs: { left: string; right: string }[];
  explanation?: string | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  unitId: string;
  unitTitle: string;
  order: number;
  title: string;
  titleIt: string;
  kind: LessonKind;
  summary: string;
  estimatedMinutes: number;
  xpReward: number;
  isFreePreview: boolean;
  blocks: LessonBlock[];
  exercises: Exercise[];
  homework?: string | null;
  previousLessonId?: string | null;
  nextLessonId?: string | null;
  stars?: number | null;
  bestScorePercent?: number | null;
  completed?: boolean | null;
}

export interface LessonResult {
  lessonId: string;
  scorePercent: number;
  stars: number;
  completed: boolean;
  isNewBest: boolean;
  xpGained: number;
  totalXp: number;
  streakDays: number;
  courseCompletionPercent: number;
  nextLessonId?: string | null;
  unitCompleted: boolean;
  courseCompleted: boolean;
}

export interface LearnerSummary {
  totalXp: number;
  streakDays: number;
  lessonsCompleted: number;
  starsEarned: number;
  wordsLearned: number;
  myCourses: CourseCard[];
  continueCourse?: CourseCard | null;
}

// ── Other ───────────────────────────────────────────────────────────────────

export interface ClassSession {
  id: string;
  courseId: string;
  courseTitle: string;
  mentorId: string;
  mentorName: string;
  title: string;
  scheduledAtUtc: string;
  durationMinutes: number;
  status: string;
  meetingUrl?: string | null;
  meetingProvider?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAtUtc?: string;
}

export interface AiResponse {
  sessionId: string;
  mode: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  isMocked: boolean;
}
