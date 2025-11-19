import { useVoting } from '../../contexts/VotingContext'
import { useCourse } from '../../contexts/CourseContext'

function TotalPoints() {
  const { getUserTotalPoints, getUserCoursePoints, getUserAchievements, currentUserId } = useVoting()
  const { selectedCourse } = useCourse()
  
  // Get user stats from voting context
  const totalPoints = getUserTotalPoints(currentUserId)
  const coursePoints = selectedCourse ? getUserCoursePoints(currentUserId, selectedCourse.id) : 0
  const achievements = getUserAchievements(currentUserId)
  
  // Calculate level based on points (every 250 points = 1 level)
  const level = Math.floor(totalPoints / 250) + 1
  const pointsInCurrentLevel = totalPoints % 250
  const pointsToNextLevel = 250 - pointsInCurrentLevel

  // Sample additional stats - in a real app, this would come from an API
  const stats = {
    notesPosted: 12,
    notesFavorited: 8,
    reelsWatched: 45,
    contributions: 20
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Points</h2>
      <p className="text-gray-600 mb-6">Track your progress and achievements</p>

      {/* Main Points Display */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{totalPoints}</div>
          <div className="text-xl mb-4">Total Points</div>
          <div className="text-lg mb-2">Level {level}</div>
          {selectedCourse && (
            <div className="text-base text-purple-100">
              {coursePoints} points in {selectedCourse.code}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress to Level {level + 1}</span>
          <span>{pointsToNextLevel} points remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-purple-500 h-4 rounded-full transition-all"
            style={{ width: `${(pointsInCurrentLevel / 250) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.notesPosted}</div>
          <div className="text-sm text-gray-600">Notes Posted</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.notesFavorited}</div>
          <div className="text-sm text-gray-600">Notes Favorited</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{stats.reelsWatched}</div>
          <div className="text-sm text-gray-600">Reels Watched</div>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
          <div className="text-2xl font-bold text-pink-700">{stats.contributions}</div>
          <div className="text-sm text-gray-600">Total Contributions</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievements</h3>
        {achievements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No achievements yet. Keep contributing to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                {achievement.points > 0 && (
                  <div className="text-sm font-semibold text-purple-600">{achievement.points} pts</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TotalPoints

