/**
 * ProtectedRoute.jsx - Route protection component
 * 
 * This component wraps protected routes to ensure only authenticated and verified users can access them.
 * Used in: App.jsx to protect all authenticated routes
 * 
 * Functionality:
 * - Shows loading spinner while checking authentication status
 * - Redirects to /login if user is not authenticated
 * - Redirects to /verify-email if user is authenticated but email is not verified
 * - Renders children (protected content) if user is authenticated and verified
 * 
 * Props:
 * - children: The component/content to render if user is authenticated
 * - requireVerification: Boolean (default: true) - whether to require email verification
 * 
 * Routes protected by this component:
 * - /browse-notes, /post-notes, /profile, /settings, /leaderboard, /note/:noteId
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requireVerification = true }) {
  const { currentUser, loading } = useAuth()

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect to email verification page if email is not verified (when required)
  if (requireVerification && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  // User is authenticated and verified - render protected content
  return children
}

export default ProtectedRoute

