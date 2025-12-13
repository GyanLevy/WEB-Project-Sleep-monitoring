import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import QuestionnaireFlow from './components/QuestionnaireFlow';
import CompletionScreen from './components/CompletionScreen';

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

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans antialiased">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
