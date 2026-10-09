import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReminderProvider } from './context/ReminderContext.jsx';
import { JobTrackerProvider } from './context/JobTrackerContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

// Pages
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Applications } from './pages/Applications.jsx';
import { Board } from './pages/Board.jsx';
import { Resumes } from './pages/Resumes.jsx';
import { Reminders } from './pages/Reminders.jsx';
import { Profile } from './pages/Profile.jsx';
import { About } from './pages/About.jsx';
import { NotFound } from './pages/NotFound.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <ReminderProvider>
            <JobTrackerProvider>
              <SearchProvider>
                <BrowserRouter>
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
                </BrowserRouter>
              </SearchProvider>
            </JobTrackerProvider>
          </ReminderProvider>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
