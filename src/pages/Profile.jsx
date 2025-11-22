import { useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SchoolSelection from '../components/profile/SchoolSelection'
import CourseSelection from '../components/profile/CourseSelection'
import TotalPoints from '../components/profile/TotalPoints'
import UserPosts from '../components/profile/UserPosts'
import FavoritedNotes from '../components/profile/FavoritedNotes'
import Leaderboard from '../components/profile/Leaderboard'

function Profile() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userData, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    const hash = location.hash.replace('#', '')
    return hash || 'courses'
  })

  const tabs = useMemo(() => [
    { id: 'school', label: 'School Selection', component: SchoolSelection },
    { id: 'courses', label: 'Course Selection', component: CourseSelection },
    { id: 'points', label: 'Total Points', component: TotalPoints },
    { id: 'posts', label: 'My Posts', component: UserPosts },
    { id: 'favorited', label: 'Favorited Notes', component: FavoritedNotes },
    { id: 'leaderboard', label: 'Leaderboard', component: Leaderboard }
  ], [])

  const ActiveComponent = useMemo(() => 
    tabs.find((tab) => tab.id === activeTab)?.component || CourseSelection
  , [tabs, activeTab])

  const { displayName, initials } = useMemo(() => {
    const name = userData?.displayName || currentUser?.email?.split('@')[0] || 'User'
    const init = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
    return { displayName: name, initials: init }
  }, [userData?.displayName, currentUser?.email])

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
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold border-4 border-white">
                  {initials}
                </div>
                <div className="ml-4 sm:ml-6">
                  <h1 className="text-xl sm:text-3xl font-bold truncate">{displayName}</h1>
                  <p className="text-purple-100 text-sm sm:text-base truncate">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-red-800 hover:text-red-900 rounded-lg font-bold transition-all text-sm sm:text-base border-2 border-red-300 hover:border-red-400 whitespace-nowrap flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
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

          {/* Tab Content */}
          <div className="p-4 sm:p-8">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
