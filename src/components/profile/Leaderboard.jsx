import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'

function Leaderboard() {
  const { currentUser } = useAuth()
  const { notes } = useNotes()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  // Calculate points for all users from votes
  useEffect(() => {
    const calculateLeaderboard = async () => {
      setLoading(true)
      try {
        // Get all votes
        const votesRef = collection(db, 'votes')
        const votesSnapshot = await getDocs(votesRef)
        const allVotes = votesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Group votes by author (note author)
        const userVoteCounts = {}
        
        // For each note, get its author and count votes
        notes.forEach(note => {
          // Match votes where noteId equals the note's ID
          const noteVotes = allVotes.filter(v => v.noteId === note.id)
          const upvotes = noteVotes.filter(v => v.type === 'upvote').length
          const downvotes = noteVotes.filter(v => v.type === 'downvote').length
          const points = upvotes - downvotes

          if (!userVoteCounts[note.authorId]) {
            userVoteCounts[note.authorId] = {
              userId: note.authorId,
              authorName: note.author,
              totalPoints: 0
            }
          }
          userVoteCounts[note.authorId].totalPoints += points
        })

        // Convert to array and sort
        const leaderboardData = Object.values(userVoteCounts)
          .map(user => ({
            ...user,
            totalPoints: Math.max(0, user.totalPoints) // Ensure non-negative
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)

        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error('Error calculating leaderboard:', error)
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    calculateLeaderboard()
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(calculateLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [notes])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Global Leaderboard</h2>
      <p className="text-gray-600 mb-6">
        Top contributors ranked by total points (upvotes - downvotes on their posts)
      </p>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-2">No points yet.</p>
          <p className="text-gray-400">Start posting and getting upvotes to appear on the leaderboard!</p>
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
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isCurrentUser
                    ? 'bg-purple-50 border-purple-300 shadow-md'
                    : isTopThree
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${isTopThree ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <div className={`font-semibold ${isTopThree || isCurrentUser ? 'text-gray-900' : 'text-gray-800'}`}>
                      {entry.authorName}
                      {isCurrentUser && <span className="ml-2 text-purple-600">(You)</span>}
                    </div>
                    {rank === 1 && (
                      <div className="text-xs text-yellow-600 font-medium">Top Contributor! 🌟</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isTopThree || isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                    {entry.totalPoints}
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
              <li>• Each upvote on your post = +1 point</li>
              <li>• Each downvote on your post = -1 point</li>
              <li>• Total points = Sum of (upvotes - downvotes) on all your posts</li>
              <li>• Points are calculated in real-time from votes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
