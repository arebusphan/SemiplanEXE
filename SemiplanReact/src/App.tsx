import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SubjectsPage from "./pages/Subjects";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import StudySessionPage from "./pages/StudySessionPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/study/:id" element={<StudySessionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Coming Soon</h1>
                <p className="text-slate-500">This feature is under construction.</p>
              </div>
            } />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}