import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StudentLayout } from './layouts/StudentLayout';
import { LoginPage } from './pages/LoginPage';
import { MyClassesPage } from './pages/MyClassesPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { LiveClassesPage } from './pages/LiveClassesPage';
import { AiTutorPage } from './pages/AiTutorPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { StateBlock } from './components/StateBlock';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <StateBlock type="loading" message="Loading your student session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Student Portal Routes */}
          <Route
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            {/* Primary default view matches SS Europa reference mockup */}
            <Route path="/" element={<MyClassesPage />} />
            <Route path="/my-classes" element={<MyClassesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CoursePlayerPage />} />
            <Route path="/practice" element={<CoursesPage />} />
            <Route path="/assignments" element={<ProgressPage />} />
            <Route path="/translator" element={<AiTutorPage />} />
            <Route path="/live-classes" element={<LiveClassesPage />} />
            <Route path="/classes" element={<LiveClassesPage />} />
            <Route path="/ai-tutor" element={<AiTutorPage />} />
            <Route path="/ai" element={<AiTutorPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

