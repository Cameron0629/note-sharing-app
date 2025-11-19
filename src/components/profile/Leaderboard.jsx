import { useVoting } from '../../contexts/VotingContext'
import { useCourse } from '../../contexts/CourseContext'

function Leaderboard() {
  const { getCourseLeaderboard } = useVoting()
  const { selectedCourse } = useCourse()

  // Mock user names - in a real app, this would come from an API
  const getUserName = (userId) => {
    const userNames = {
      'user1': 'Current User',
      'user2': 'John Doe',
      'user3': 'Jane Smith',
      'user4': 'Bob Johnson',
      'user5': 'Alice Williams',
      'user6': 'Charlie Brown'
    }
    return userNames[userId] || `User ${userId}`
  }

  if (!selectedCourse) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg mb-4">Please select a course to view the leaderboard.</p>
        <p className="text-gray-400">Go to Course Selection to choose a course.</p>
      </div>
    )
  }

  const leaderboard = getCourseLeaderboard(selectedCourse.id)

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Leaderboard</h2>
      <p className="text-gray-600 mb-6">
        Top contributors in <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Teachers can use this leaderboard to award extra credit to top contributors!
      </p>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-2">No points yet for this course.</p>
          <p className="text-gray-400">Start upvoting posts and reels to see the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3
            
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isTopThree
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${isTopThree ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <div className={`font-semibold ${isTopThree ? 'text-gray-900' : 'text-gray-800'}`}>
                      {getUserName(entry.userId)}
                    </div>
                    {rank === 1 && (
                      <div className="text-xs text-yellow-600 font-medium">Top Contributor! 🌟</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isTopThree ? 'text-purple-600' : 'text-gray-700'}`}>
                    {entry.points}
                  </span>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="font-semibold text-blue-900 mb-1">How Points Work</div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each upvote on your post/reel = +10 points</li>
              <li>• Each downvote on your post/reel = -2 points</li>
              <li>• Points are tracked per course</li>
              <li>• Teachers can use this leaderboard for extra credit!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard

