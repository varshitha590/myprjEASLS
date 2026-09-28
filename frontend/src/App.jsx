import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import WatchVideo from "./pages/WatchVideo";
import Analytics from "./pages/Analytics";
import Register from "./pages/register.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import LandingPage from "./pages/landingPage";
import YouTubeSearch from "./pages/youTubeSearch.jsx";
import RecentSessions from "./pages/RecentSessions";
import ReportPage from "./pages/ReportPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminVideos from "./pages/AdminVideos";
import AdminSettings from "./pages/AdminSettings";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* USER PAGES */}

        <Route path="/" element={
          <AppLayout>
            <LandingPage />
          </AppLayout>
        } />

        <Route path="/dashboard" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />

        <Route path="/search" element={
          <AppLayout>
            <YouTubeSearch />
          </AppLayout>
        } />

        <Route path="/watch/:id" element={
          <AppLayout>
            <WatchVideo />
          </AppLayout>
        } />

        <Route path="/analytics" element={
          <AppLayout>
            <Analytics />
          </AppLayout>
        } />

        <Route path="/recent-sessions" element={
          <AppLayout>
            <RecentSessions />
          </AppLayout>
        } />

        <Route path="/report/:sessionId" element={
  <AppLayout>
    <ReportPage />
  </AppLayout>
} />

        {/* AUTH */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/session/:id" element={<WatchVideo />} />

        {/* ADMIN PANEL */}

        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-videos" element={<AdminVideos />} />
          <Route path="/admin-settings" element={<AdminSettings />} />

        </Route>

        {/* 404 */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;