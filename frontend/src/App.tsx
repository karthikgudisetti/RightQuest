import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { ModulePage } from './pages/ModulePage';
import { StoriesPage } from './pages/StoriesPage';
import { ScenarioPlayerPage } from './pages/ScenarioPlayerPage';
import { QuizPage } from './pages/QuizPage';
import { BadgesPage } from './pages/BadgesPage';
import { ProgressPage } from './pages/ProgressPage';
import { TutorPage } from './pages/TutorPage';
import { GamesPage } from './pages/GamesPage';
import { VideosPage } from './pages/VideosPage';
import { AdminDashboard, AdminKnowledgePage, AdminModulesPage } from './pages/AdminPages';

function Protected({
  children,
  admin,
  allowOnboarding,
}: {
  children: React.ReactNode;
  admin?: boolean;
  allowOnboarding?: boolean;
}) {
  const { user, onboardingDone, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-[#0a4f49]">
        Loading RightsQuest…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowOnboarding && onboardingDone && user.role === 'CHILD') {
    return <Navigate to="/" replace />;
  }
  if (!admin && !onboardingDone && user.role === 'CHILD' && !allowOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  if (admin && user.role !== 'ADMIN' && user.role !== 'CONTENT_REVIEWER') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  const ready = useAuth((s) => s.ready);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-[#0a4f49]">
        Loading RightsQuest…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/onboarding"
        element={
          <Protected allowOnboarding>
            <OnboardingPage />
          </Protected>
        }
      />
      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/:id" element={<ModulePage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:id" element={<ScenarioPlayerPage />} />
        <Route path="/quizzes/:id" element={<QuizPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/tutor" element={<TutorPage />} />
      </Route>
      <Route
        element={
          <Protected admin>
            <AppShell />
          </Protected>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/modules" element={<AdminModulesPage />} />
        <Route path="/admin/knowledge" element={<AdminKnowledgePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
