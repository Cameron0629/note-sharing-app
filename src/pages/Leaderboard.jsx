/**
 * Leaderboard.jsx - Leaderboard page component
 * 
 * This page displays a ranked list of users based on their total points.
 * Points are calculated from upvotes and downvotes on their posted notes.
 * 
 * Route: /leaderboard (protected route, requires authentication)
 * Accessed from: Navigation bar "Leaderboard" link
 * 
 * Features:
 * - Global leaderboard showing all users across all schools
 * - School-specific filtering to view leaderboard for a specific school
 * - Highlights top 3 users with special styling and medals
 * - Highlights current user's position
 * - Shows school name for each user when viewing global leaderboard
 * - Displays points calculation explanation
 * 
 * Data Sources:
 * - UsersContext: Provides all user data including totalPoints
 * - SchoolsContext: Provides school data for filtering
 * - AuthContext: Provides current user for highlighting
 */

import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsers } from '../contexts/UsersContext'
import { useSchools } from '../contexts/SchoolsContext'

function Leaderboard() {
  const { currentUser } = useAuth() // Current logged-in user
  const { users, loading: usersLoading } = useUsers() // All users with their points
  const { schools, loading: schoolsLoading } = useSchools() // All schools for filtering
  const [selectedSchoolId, setSelectedSchoolId] = useState('all') // Selected school filter ('all' for global)

  const loading = usersLoading || schoolsLoading

  /**
   * Calculate and sort leaderboard entries
   * - Filters users by selected school (if not 'all')
   * - Includes users with points > 0 OR the current user (so current user always appears)
   * - Maps user data to leaderboard entry format
   * - Sorts by totalPoints descending
   */
  const leaderboard = useMemo(() => {
    // Filter users by school if a specific school is selected
    const filteredUsers = selectedSchoolId !== 'all' 
      ? users.filter(user => user.schoolId === selectedSchoolId)
      : users

    // Process users into leaderboard entries
    return filteredUsers
      .filter(user => (user.totalPoints || 0) > 0 || user.uid === currentUser?.uid) // Show users with points or current user
      .map(user => ({
        userId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        totalPoints: Math.max(0, user.totalPoints || 0), // Ensure non-negative points
        schoolId: user.schoolId
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by points descending
  }, [users, currentUser?.uid, selectedSchoolId])

  /**
   * Get icon/display for rank position
   * - Top 3 get medal emojis
   * - Others get rank number
   */
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  // Get selected school object for display
  const selectedSchool = schools.find(s => s.id === selectedSchoolId)
  
  // Generate title based on filter selection
  const leaderboardTitle = selectedSchoolId === 'all' 
    ? 'Global Leaderboard' 
    : `${selectedSchool?.name || 'School'} Leaderboard`

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{leaderboardTitle}</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Top contributors ranked by total points (upvotes - downvotes on their posts)
            </p>

            {/* School Filter Dropdown - allows filtering leaderboard by school */}
            <div className="mb-6">
              <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by School
              </label>
              <select
                id="school-filter"
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
              >
                <option value="all">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-base sm:text-lg text-gray-500 mb-2">No points yet.</p>
              <p className="text-sm text-gray-400">
                {selectedSchoolId === 'all' 
                  ? 'Start posting and getting upvotes to appear on the leaderboard!'
                  : 'No users from this school have points yet.'}
              </p>
            </div>
          ) : (
            /* Leaderboard Entries - displays ranked list of users */
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1 // Calculate rank (1-based index)
                const isTopThree = rank <= 3 // Check if in top 3 for special styling
                const isCurrentUser = entry.userId === currentUser?.uid // Check if this is the current user
                const entrySchool = schools.find(s => s.id === entry.schoolId) // Get school name for display
                
                return (
                  /* Individual Leaderboard Entry - styled based on rank and user */
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      isCurrentUser
                        ? 'bg-purple-50 border-purple-300 shadow-md' // Current user gets purple highlight
                        : isTopThree
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md' // Top 3 get gold gradient
                        : 'bg-white border-gray-200 hover:shadow-md' // Others get standard styling
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className={`text-xl sm:text-2xl font-bold flex-shrink-0 ${isTopThree ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {getRankIcon(rank)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold truncate text-sm sm:text-base ${isTopThree || isCurrentUser ? 'text-gray-900' : 'text-gray-800'}`}>
                          {entry.authorName}
                          {isCurrentUser && <span className="ml-2 text-purple-600">(You)</span>}
                        </div>
                        {/* Show school name when viewing global leaderboard */}
                        {entrySchool && selectedSchoolId === 'all' && (
                          <div className="text-xs text-gray-500 mt-1">{entrySchool.name}</div>
                        )}
                        {/* Special badge for #1 ranked user */}
                        {rank === 1 && (
                          <div className="text-xs text-yellow-600 font-medium">Top Contributor! 🌟</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-lg sm:text-xl font-bold ${isTopThree || isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                        {entry.totalPoints}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Points Explanation Section - explains how the point system works */}
          <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">💡</span>
              <div>
                <div className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">How Points Work</div>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Each upvote on your post = +1 point</li>
                  <li>• Each downvote on your post = -1 point</li>
                  <li>• Total points = Sum of (upvotes - downvotes) on all your posts</li>
                  <li>• Points are updated in real-time when users vote on your posts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard

