/**
 * Navigation.jsx - Top navigation bar component
 * 
 * This component renders the main navigation bar that appears at the top of all authenticated pages.
 * It provides navigation links, displays the currently selected course, and shows user profile information.
 * 
 * Used in: App.jsx (rendered on all pages except auth pages)
 * 
 * Features:
 * - Main navigation links: Browse Notes, Post Notes, Leaderboard, Profile
 * - Displays currently selected course badge (desktop only)
 * - User avatar/initials with link to profile
 * - Mobile-responsive hamburger menu
 * - Logout functionality
 * 
 * Routes to:
 * - /browse-notes - Main notes browsing page
 * - /post-notes - Create new notes page
 * - /leaderboard - Leaderboard page
 * - /profile - User profile page
 * 
 * Hides on: Login, Signup, Verify Email, Forgot Password pages
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCourse } from '../contexts/CourseContext'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedCourse } = useCourse() // Get currently selected course from context
  const { currentUser, userData, logout } = useAuth() // Get user authentication data
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // State for mobile menu toggle

  // Check if current path matches a given path (for active link highlighting)
  const isActive = (path) => location.pathname === path
  
  // List of authentication pages where navigation should be hidden
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password'].includes(location.pathname)

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Don't show navigation on auth pages or if user is not authenticated
  if (isAuthPage || !currentUser) {
    return null
  }

  // Generate user display name from userData or email
  const displayName = userData?.displayName || currentUser?.email?.split('@')[0] || 'User'
  
  // Generate user initials from display name (first letter of each word, max 2 characters)
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
  
  // Get user profile picture URL if available
  const profilePictureUrl = userData?.profilePictureUrl || null

  // Navigation links configuration - defines main navigation menu items
  const navLinks = [
    { path: '/browse-notes', label: 'Browse Notes', icon: '📚' },
    { path: '/post-notes', label: 'Post Notes', icon: '✍️' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - links to browse notes page */}
          <Link
            to="/browse-notes"
            className="flex items-center text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span className="hidden sm:inline">NoteShare</span>
            <span className="sm:hidden">NS</span>
          </Link>

          {/* Desktop Navigation Links - centered navigation menu (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Course Badge and User Menu */}
          <div className="flex items-center gap-3">
            {/* Selected Course Badge - shows currently selected course (desktop only, hidden on mobile) */}
            {selectedCourse && (
              <div className="hidden lg:flex items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xs text-gray-600 mr-2">Course:</span>
                <span className="text-sm font-semibold text-blue-700 truncate max-w-[150px]">
                  {selectedCourse.code}
                </span>
              </div>
            )}

            {/* User Menu - avatar and mobile menu button */}
            <div className="flex items-center gap-2">
              {/* User Avatar/Initials - links to profile page */}
              <Link
                to="/profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-200 transition-colors overflow-hidden"
                title={displayName}
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </Link>

              {/* Mobile Menu Toggle Button - hamburger/close icon (only visible on mobile) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - dropdown menu for mobile devices (hidden on desktop) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Course Display - shows selected course in mobile menu */}
            {selectedCourse && (
              <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-200 mx-4">
                <span className="text-xs text-gray-600">Active Course:</span>
                <p className="text-sm font-semibold text-blue-700">
                  {selectedCourse.code} - {selectedCourse.name}
                </p>
              </div>
            )}

            {/* Mobile User Info and Logout Section */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 hover:text-red-900 rounded-lg transition-all duration-200 text-left border border-red-200 hover:border-red-300 shadow-sm hover:shadow"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
