import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUsers } from '../../contexts/UsersContext'

function Leaderboard() {
  const { currentUser } = useAuth()
  const { users, loading } = useUsers()

  const leaderboard = useMemo(() => {
    return users
      .filter(user => (user.totalPoints || 0) > 0 || user.uid === currentUser?.uid)
      .map(user => ({
        userId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        totalPoints: Math.max(0, user.totalPoints || 0)
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
  }, [users, currentUser?.uid])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Global Leaderboard</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Top contributors ranked by total points (upvotes - downvotes on their posts)
      </p>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-base sm:text-lg text-gray-500 mb-2">No points yet.</p>
          <p className="text-sm text-gray-400">Start posting and getting upvotes to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3
            const isCurrentUser = entry.userId === currentUser?.uid
            
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  isCurrentUser
                    ? 'bg-purple-50 border-purple-300 shadow-md'
                    : isTopThree
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-md'
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
  )
}

export default Leaderboard
