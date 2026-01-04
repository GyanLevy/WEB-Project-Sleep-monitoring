import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './components/LoginScreen';
import QuestionnaireFlow from './components/QuestionnaireFlow';
import CompletionScreen from './components/CompletionScreen';
import GameView from './components/GameView';
import DebugSeeder from './components/DebugSeeder';

// CONFIGURATION
// Set to true to show the DevTools/Smart Seeder in the UI
const SHOW_DEV_TOOLS = false;


// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// App Routes
function AppRoutes() {
  const { isAuthenticated, hasSubmittedToday } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            hasSubmittedToday() ? (
              <Navigate to="/complete" replace />
            ) : (
              <Navigate to="/diary" replace />
            )
          ) : (
            <LoginScreen />
          )
        } 
      />

      {/* Diary Route - Protected */}
      <Route
        path="/diary"
        element={
          <ProtectedRoute>
            <QuestionnaireFlow />
          </ProtectedRoute>
        }
      />

      {/* Completion Route - Protected */}
      <Route
        path="/complete"
        element={
          <ProtectedRoute>
            <CompletionScreen />
          </ProtectedRoute>
        }
      />

      {/* Game Route - Protected */}
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GameView />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="font-sans antialiased">
            <AppRoutes />
            
            {/* Debug Seeder - Controlled by SHOW_DEV_TOOLS flag */}
            {SHOW_DEV_TOOLS && <DebugSeeder />}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

