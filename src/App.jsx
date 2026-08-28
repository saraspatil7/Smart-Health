import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Auth from "./pages/Auth";

// 🌟 LINKED LANDING PAGE IMPORT
import LandingPage from "./pages/LandingPage"; 

// Dashboard Layout
import DashboardLayout from "./components/DashboardLayout";

// Dashboard Pages
import DashboardHome from "./pages/dashboard/Dashboard";
import Analytics from "./pages/Analytics";
import LogMetrics from "./pages/LogMetrics";
import AIWorkspace from "./pages/AIWorkspace";
import Reminder from "./pages/Reminder";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";

// Route Protection
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Gate */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* Protected Dashboard Shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="log" element={<LogMetrics />} />
            <Route path="ai" element={<AIWorkspace />} />
            <Route path="reminders" element={<Reminder />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 🌟 1️⃣ LINKED ROOT ROUTE: Opens your Landing Page first */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* 2️⃣ CATCH-ALL ROUTE: Redirects any broken link back to the Landing Page */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}