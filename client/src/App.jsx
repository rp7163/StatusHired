import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReminderProvider } from './context/ReminderContext.jsx';
import { JobTrackerProvider } from './context/JobTrackerContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { Skeleton } from './components/ui/Skeleton.jsx';

// Pages (Lazy Loaded for minimal initial bundle and fast first paint)
const Login = lazy(() => import('./pages/Login.jsx').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })));
const Applications = lazy(() => import('./pages/Applications.jsx').then((m) => ({ default: m.Applications })));
const Board = lazy(() => import('./pages/Board.jsx').then((m) => ({ default: m.Board })));
const Resumes = lazy(() => import('./pages/Resumes.jsx').then((m) => ({ default: m.Resumes })));
const Reminders = lazy(() => import('./pages/Reminders.jsx').then((m) => ({ default: m.Reminders })));
const Profile = lazy(() => import('./pages/Profile.jsx').then((m) => ({ default: m.Profile })));
const About = lazy(() => import('./pages/About.jsx').then((m) => ({ default: m.About })));
const NotFound = lazy(() => import('./pages/NotFound.jsx').then((m) => ({ default: m.NotFound })));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Skeleton variant="rounded" className="w-48 h-8 mx-auto" />
        <Skeleton variant="rounded" className="w-full h-32" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <ReminderProvider>
            <JobTrackerProvider>
              <SearchProvider>
                <BrowserRouter>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Public Authentication Route */}
                      <Route path="/login" element={<Login />} />

                      {/* Protected Application Routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <AppShell />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Navigate to="/" replace />} />
                        <Route path="applications" element={<Applications />} />
                        <Route path="board" element={<Board />} />
                        <Route path="resumes" element={<Resumes />} />
                        <Route path="reminders" element={<Reminders />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* Catch-all global 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </SearchProvider>
            </JobTrackerProvider>
          </ReminderProvider>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
