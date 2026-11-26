import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { I18nProvider } from './i18n';
import { LanguageSync } from './i18n/LanguagePicker';
import { StudentLayout } from './layouts/StudentLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CoursePage } from './pages/CoursePage';
import { LessonPage } from './pages/LessonPage';
import { LiveClassesPage } from './pages/LiveClassesPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TutorPage } from './pages/TutorPage';
import { AI_TUTOR_ENABLED } from './lib/features';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Account made by the team: the student chooses their own password before anything else.
  if (user.mustChangePassword) return <ChangePasswordPage />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
      <AuthProvider>
        <LanguageSync />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <Protected>
                <StudentLayout />
              </Protected>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CoursePage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/live-classes" element={<LiveClassesPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/tutor" element={AI_TUTOR_ENABLED ? <TutorPage /> : <Navigate to="/" replace />} />
            {/* Old links */}
            <Route path="/my-classes" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/classes" element={<Navigate to="/live-classes" replace />} />
            <Route path="/ai-tutor" element={<Navigate to="/tutor" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

export default App;
