import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SchoolSelection from '../components/profile/SchoolSelection'
import TotalPoints from '../components/profile/TotalPoints'
import UserPosts from '../components/profile/UserPosts'
import Leaderboard from '../components/profile/Leaderboard'

function Profile() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => {
    // Get tab from URL hash or default to 'points'
    const hash = location.hash.replace('#', '')
    return hash || 'points'
  })

  const tabs = [
    { id: 'school', label: 'School Selection', component: SchoolSelection },
    { id: 'points', label: 'Total Points', component: TotalPoints },
    { id: 'posts', label: 'My Posts', component: UserPosts },
    { id: 'leaderboard', label: 'Leaderboard', component: Leaderboard }
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || TotalPoints

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
                U
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">User Profile</h1>
                <p className="text-purple-100">user@example.com</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    window.location.hash = tab.id
                  }}
                  className={`px-6 py-4 font-medium transition-colors ${
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
          <div className="p-8">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
