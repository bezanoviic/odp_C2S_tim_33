import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";


import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";



import AdminGamesPage  from "./pages/admin/AdminGamesPage";
import AdminHealthPage from "./pages/admin/AdminHealthPage";
import AdminAuditPage  from "./pages/admin/AdminAuditPage";
import GamesPage       from "./pages/GamesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public routes */}
      <Route path="/games" element={<GamesPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="player"><UserDashboard /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin"          element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"    element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/games"    element={<ProtectedRoute requiredRole="admin"><AdminGamesPage /></ProtectedRoute>} />
      <Route path="/admin/health"   element={<ProtectedRoute requiredRole="admin"><AdminHealthPage /></ProtectedRoute>} />
      <Route path="/admin/audit"    element={<ProtectedRoute requiredRole="admin"><AdminAuditPage /></ProtectedRoute>} />

      <Route path="/"    element={<Navigate to="/login" replace />} />
<Route
  path="/teams"
  element={
    <ProtectedRoute requiredRole="player">
      <TeamsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/teams/:id"
  element={
    <ProtectedRoute requiredRole="player">
      <TeamDetailsPage />
    </ProtectedRoute>
  }
/>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );

}


