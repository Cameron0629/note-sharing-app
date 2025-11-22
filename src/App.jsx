/**
 * App.jsx - Main application component
 * 
 * This is the root component that sets up the React Router and all context providers.
 * It defines all application routes and wraps protected routes with authentication.
 * 
 * Context Provider Hierarchy (order matters):
 * - AuthProvider: Manages user authentication state
 * - SchoolsProvider: Manages school data (depends on AuthProvider)
 * - CoursesProvider: Manages course data (depends on AuthProvider and SchoolsProvider)
 * - NotesProvider: Manages note/post data (depends on AuthProvider)
 * - VotingProvider: Manages voting functionality (depends on AuthProvider and NotesProvider)
 * - UsersProvider: Manages user data for leaderboard (depends on AuthProvider)
 * - CourseProvider: Manages currently selected course (depends on AuthProvider and CoursesProvider)
 * 
 * Routes:
 * - Public routes (no authentication required):
 *   - /login - Login page
 *   - /signup - User registration page
 *   - /verify-email - Email verification page
 *   - /forgot-password - Password reset page
 * 
 * - Protected routes (require authentication and email verification):
 *   - / - Redirects to /browse-notes
 *   - /browse-notes - Main page to browse and search notes
 *   - /post-notes - Page to create and post new notes
 *   - /profile - User profile page with tabs for school, courses, points, posts, favorites
 *   - /note/:noteId - Detail page for viewing a specific note
 *   - /settings - User settings page (profile picture, bio, password, etc.)
 *   - /leaderboard - Global and school-specific leaderboard showing user rankings
 *   - /course-selection - Legacy route, redirects to /profile#courses
 */

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
import Leaderboard from './pages/Leaderboard'

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
                      {/* Public Routes - No authentication required */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      
                      {/* Protected Routes - Require authentication and email verification */}
                      {/* Root path redirects to browse notes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/browse-notes" replace />
                          </ProtectedRoute>
                        }
                      />
                      {/* Legacy route redirects to profile course selection tab */}
                      <Route
                        path="/course-selection"
                        element={
                          <ProtectedRoute>
                            <Navigate to="/profile#courses" replace />
                          </ProtectedRoute>
                        }
                      />
                      {/* Main notes browsing page with search and filtering */}
                      <Route
                        path="/browse-notes"
                        element={
                          <ProtectedRoute>
                            <BrowseNotes />
                          </ProtectedRoute>
                        }
                      />
                      {/* Page for creating and posting new notes */}
                      <Route
                        path="/post-notes"
                        element={
                          <ProtectedRoute>
                            <PostNotes />
                          </ProtectedRoute>
                        }
                      />
                      {/* User profile page with multiple tabs (school, courses, points, posts, favorites) */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      {/* Individual note detail page showing full note content */}
                      <Route
                        path="/note/:noteId"
                        element={
                          <ProtectedRoute>
                            <NoteDetail />
                          </ProtectedRoute>
                        }
                      />
                      {/* User settings page for managing account, profile, and password */}
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      {/* Leaderboard page showing user rankings by points, filterable by school */}
                      <Route
                        path="/leaderboard"
                        element={
                          <ProtectedRoute>
                            <Leaderboard />
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
 