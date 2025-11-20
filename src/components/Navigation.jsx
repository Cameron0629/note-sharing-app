import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCourse } from '../contexts/CourseContext'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedCourse } = useCourse()
  const { currentUser, userData, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password'].includes(location.pathname)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Don't show navigation on auth pages
  if (isAuthPage) {
    return null
  }

  // Don't show navigation if not authenticated
  if (!currentUser) {
    return null
  }

  const displayName = userData?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const navLinks = [
    { path: '/browse-notes', label: 'Browse Notes', icon: '📚' },
    { path: '/post-notes', label: 'Post Notes', icon: '✍️' },
    { path: '/reels', label: 'Reels', icon: '🎬' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/browse-notes"
            className="flex items-center text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span className="hidden sm:inline">NoteShare</span>
            <span className="sm:hidden">NS</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Right side - Course & User */}
          <div className="flex items-center gap-3">
            {/* Selected Course Badge */}
            {selectedCourse && (
              <div className="hidden lg:flex items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xs text-gray-600 mr-2">Course:</span>
                <span className="text-sm font-semibold text-blue-700 truncate max-w-[150px]">
                  {selectedCourse.code}
                </span>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* User Avatar/Initials */}
              <Link
                to="/profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-200 transition-colors"
                title={displayName}
              >
                {initials}
              </Link>

              {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
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
            
            {/* Mobile Course Display */}
            {selectedCourse && (
              <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-200 mx-4">
                <span className="text-xs text-gray-600">Active Course:</span>
                <p className="text-sm font-semibold text-blue-700">
                  {selectedCourse.code} - {selectedCourse.name}
                </p>
              </div>
            )}

            {/* Mobile User Info & Logout */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
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
