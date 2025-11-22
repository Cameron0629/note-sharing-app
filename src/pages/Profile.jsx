/**
 * Profile.jsx - User profile page
 * 
 * This page displays the user's profile information and provides access to various profile-related features
 * through a tabbed interface. Users can manage their school, courses, view points, posts, and favorites.
 * 
 * Route: /profile (protected route, requires authentication)
 * Accessed from: Navigation bar "Profile" link, user avatar click
 * 
 * URL Hash Navigation:
 * - /profile#school - Opens School Selection tab
 * - /profile#courses - Opens Course Selection tab (default)
 * - /profile#points - Opens Total Points tab
 * - /profile#posts - Opens My Posts tab
 * - /profile#favorited - Opens Favorited Notes tab
 * 
 * Features:
 * - Profile header with user avatar, name, email, and bio
 * - Settings button (links to /settings)
 * - Logout button
 * - Tabbed interface with 5 tabs:
 *   1. School Selection - Select or add schools
 *   2. Course Selection - Select, add, or favorite courses
 *   3. Total Points - View points breakdown and ranking
 *   4. My Posts - View and manage user's posted notes
 *   5. Favorited Notes - View notes user has favorited
 * 
 * Components Used:
 * - SchoolSelection: Component for school management
 * - CourseSelection: Component for course management
 * - TotalPoints: Component displaying user's points
 * - UserPosts: Component displaying user's posted notes
 * - FavoritedNotes: Component displaying user's favorited notes
 * 
 * Data Sources:
 * - AuthContext: Provides user data, logout function
 */

import { useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SchoolSelection from '../components/profile/SchoolSelection'
import CourseSelection from '../components/profile/CourseSelection'
import TotalPoints from '../components/profile/TotalPoints'
import UserPosts from '../components/profile/UserPosts'
import FavoritedNotes from '../components/profile/FavoritedNotes'

function Profile() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userData, logout } = useAuth() // User authentication and data
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize active tab from URL hash (e.g., /profile#courses)
    const hash = location.hash.replace('#', '')
    return hash || 'courses' // Default to 'courses' tab
  })

  // Tab configuration - defines all available tabs and their components
  const tabs = useMemo(() => [
    { id: 'school', label: 'School Selection', component: SchoolSelection },
    { id: 'courses', label: 'Course Selection', component: CourseSelection },
    { id: 'points', label: 'Total Points', component: TotalPoints },
    { id: 'posts', label: 'My Posts', component: UserPosts },
    { id: 'favorited', label: 'Favorited Notes', component: FavoritedNotes }
  ], [])

  const ActiveComponent = useMemo(() => 
    tabs.find((tab) => tab.id === activeTab)?.component || CourseSelection
  , [tabs, activeTab])

  const { displayName, initials, profilePictureUrl } = useMemo(() => {
    const name = userData?.displayName || currentUser?.email?.split('@')[0] || 'User'
    const init = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
    return { 
      displayName: name, 
      initials: init,
      profilePictureUrl: userData?.profilePictureUrl || null
    }
  }, [userData?.displayName, userData?.profilePictureUrl, currentUser?.email])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }, [logout, navigate])

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    window.location.hash = tabId
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={displayName}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold border-4 border-white">
                    {initials}
                  </div>
                )}
                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold truncate">{displayName}</h1>
                  <p className="text-purple-100 text-sm sm:text-base truncate">{currentUser?.email}</p>
                  {userData?.bio && (
                    <p className="text-purple-100 text-sm sm:text-base mt-2 line-clamp-2">{userData.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  title="Settings"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-red-800 hover:text-red-900 rounded-lg font-bold transition-all text-sm sm:text-base border-2 border-red-300 hover:border-red-400 whitespace-nowrap flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          
          <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 sm:px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          
          <div className="p-4 sm:p-8">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
