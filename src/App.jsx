import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CourseProvider } from './contexts/CourseContext'
import { VotingProvider } from './contexts/VotingContext'
import { NotesProvider } from './contexts/NotesContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import CourseSelection from './pages/CourseSelection'
import BrowseNotes from './pages/BrowseNotes'
import PostNotes from './pages/PostNotes'
import Reels from './pages/Reels'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <VotingProvider>
        <NotesProvider>
          <CourseProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected routes - require authentication and email verification */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/course-selection" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/course-selection"
                    element={
                      <ProtectedRoute>
                        <CourseSelection />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/browse-notes"
                    element={
                      <ProtectedRoute>
                        <BrowseNotes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-notes"
                    element={
                      <ProtectedRoute>
                        <PostNotes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reels"
                    element={
                      <ProtectedRoute>
                        <Reels />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </BrowserRouter>
          </CourseProvider>
        </NotesProvider>
      </VotingProvider>
    </AuthProvider>
  )
}

export default App
 