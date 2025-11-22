import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CourseProvider } from './contexts/CourseContext'
import { CoursesProvider } from './contexts/CoursesContext'
import { SchoolsProvider } from './contexts/SchoolsContext'
import { VotingProvider } from './contexts/VotingContext'
import { NotesProvider } from './contexts/NotesContext'
import { UsersProvider } from './contexts/UsersContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import BrowseNotes from './pages/BrowseNotes'
import PostNotes from './pages/PostNotes'
import Profile from './pages/Profile'
import NoteDetail from './pages/NoteDetail'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <SchoolsProvider>
        <CoursesProvider>
          <NotesProvider>
            <VotingProvider>
              <UsersProvider>
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
                            <Navigate to="/browse-notes" replace />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/course-selection"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/profile#courses" replace />
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
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/note/:noteId"
                        element={
                          <ProtectedRoute>
                            <NoteDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </div>
                </BrowserRouter>
              </CourseProvider>
            </UsersProvider>
          </VotingProvider>
        </NotesProvider>
      </CoursesProvider>
    </SchoolsProvider>
  </AuthProvider>
  )
}

export default App
 