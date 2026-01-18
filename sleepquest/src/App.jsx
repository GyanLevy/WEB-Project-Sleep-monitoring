import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { AdminProvider } from "./context/AdminContext";
import { useAdmin } from "./context/adminHelpers";
import { TeacherProvider } from "./context/TeacherContext";
import { useTeacher } from "./hooks/useTeacher";
import { ThemeProvider } from "./context/ThemeContext";

// Student Components
import LoginScreen from "./components/LoginScreen";
import QuestionnaireFlow from "./components/QuestionnaireFlow";
import CompletionScreen from "./components/CompletionScreen";
import GameView from "./components/GameView";

// Admin Components
import AdminLoginScreen from "./components/AdminLoginScreen";
import AdminDashboard from "./components/AdminDashboard";
import { TeacherManagementProvider } from "./context/TeacherManagementContext";
import { ClassManagementProvider } from "./context/ClassManagementContext";

// Teacher Components
import TeacherLoginScreen from "./components/TeacherLoginScreen";
import TeacherDashboard from "./components/TeacherDashboard";

//Question Components

// ========================================
// CONFIGURATION
// ========================================
// Set to true to show the DevTools/Smart Seeder in the UI
const SHOW_DEV_TOOLS = false;

// ========================================
// PROTECTED ROUTE - STUDENT
// ========================================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ========================================
// PROTECTED ROUTE - ADMIN
// ========================================
function AdminProtectedRoute({ children }) {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// ========================================
// PROTECTED ROUTE - TEACHER
// ========================================
function TeacherProtectedRoute({ children }) {
  const { isAuthenticated } = useTeacher();

  if (!isAuthenticated) {
    return <Navigate to="/teacher/login" replace />;
  }

  return children;
}

// ========================================
// APP ROUTES - ALL ROUTES IN ONE PLACE
// ========================================
function AppRoutes() {
  const { isAuthenticated, hasSubmittedToday } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdmin();
  const { isAuthenticated: isTeacherAuthenticated } = useTeacher();

  return (
    <Routes>
      {/* ========================================
          STUDENT ROUTES
          ======================================== */}

      {/* Login Route - Home Page */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            hasSubmittedToday() ? (
              <Navigate to="/complete" replace />
            ) : (
              <Navigate to="/diary" replace />
            )
          ) : isAdminAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : isTeacherAuthenticated ? (
            <Navigate to="/teacher/dashboard" replace />
          ) : (
            <LoginScreen />
          )
        }
      />

      {/* Diary Route - Questionnaire */}
      <Route
        path="/diary"
        element={
          <ProtectedRoute>
            <QuestionnaireFlow />
          </ProtectedRoute>
        }
      />

      {/* Completion Route - After Submission */}
      <Route
        path="/complete"
        element={
          <ProtectedRoute>
            <CompletionScreen />
          </ProtectedRoute>
        }
      />

      {/* Game Route - Game View */}
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GameView />
          </ProtectedRoute>
        }
      />

      {/* ========================================
          ADMIN ROUTES
          ======================================== */}

      {/* Admin Login Route */}
      <Route
        path="/admin/login"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <AdminLoginScreen />
          )
        }
      />

      {/* Admin Dashboard Route - Protected */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* ========================================
          TEACHER ROUTES
          ======================================== */}

      {/* Teacher Login Route */}
      <Route
        path="/teacher/login"
        element={
          isTeacherAuthenticated ? (
            <Navigate to="/teacher/dashboard" replace />
          ) : (
            <TeacherLoginScreen />
          )
        }
      />

      {/* Teacher Dashboard Route - Protected */}
      <Route
        path="/teacher/dashboard"
        element={
          <TeacherProtectedRoute>
            <TeacherDashboard />
          </TeacherProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ========================================
// MAIN APP COMPONENT
// ========================================
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <TeacherManagementProvider>
            <ClassManagementProvider>
              <TeacherProvider>
                <Router>
                  <div className="font-sans antialiased">
                    <AppRoutes />

                    {/* Debug Seeder - Controlled by SHOW_DEV_TOOLS flag */}
                    {SHOW_DEV_TOOLS && <DebugSeeder />}
                  </div>
                </Router>
              </TeacherProvider>
            </ClassManagementProvider>
          </TeacherManagementProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
