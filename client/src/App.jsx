import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PracticeModulePage from "./pages/PracticeModulePage";
import PracticeQuestionsPage from "./pages/PracticeQuestionsPage";
import PracticeHistoryPage from "./pages/PracticeHistoryPage";
import RoadmapPage from "./pages/RoadmapPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import AdminContactPage from "./pages/AdminContactPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminUsersPage from "./pages/AdminUsersPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <PracticeModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/questions"
        element={
          <ProtectedRoute>
            <PracticeQuestionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/history"
        element={
          <ProtectedRoute>
            <PracticeHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="contact" element={<AdminContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}

export default App;
