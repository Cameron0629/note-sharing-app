import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

function TotalPoints() {
  const { currentUser, userData } = useAuth()
  const { notes } = useNotes()
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  // Calculate points from votes on user's notes
  useEffect(() => {
    const calculatePoints = async () => {
      if (!currentUser) {
        setTotalPoints(0)
        setLoading(false)
        return
      }

      try {
        // Get all notes created by this user
        const userNotes = notes.filter(note => note.authorId === currentUser.uid)
        
        if (userNotes.length === 0) {
          setTotalPoints(0)
          setLoading(false)
          return
        }

        // Get all votes for these notes
        const votesRef = collection(db, 'votes')
        const noteIds = userNotes.map(note => note.id)

        // Firestore 'in' operator supports up to 10 items, so batch if needed
        let allVotes = []
        if (noteIds.length > 0) {
          for (let i = 0; i < noteIds.length; i += 10) {
            const batch = noteIds.slice(i, i + 10)
            const q = query(votesRef, where('noteId', 'in', batch))
            const snapshot = await getDocs(q)
            allVotes = [...allVotes, ...snapshot.docs.map(doc => doc.data())]
          }
        }

        // Calculate points: sum of upvotes - sum of downvotes
        const upvotes = allVotes.filter(v => v.type === 'upvote').length
        const downvotes = allVotes.filter(v => v.type === 'downvote').length
        const points = upvotes - downvotes

        setTotalPoints(Math.max(0, points))
      } catch (error) {
        console.error('Error calculating points:', error)
        setTotalPoints(0)
      } finally {
        setLoading(false)
      }
    }

    calculatePoints()
    // Recalculate every 5 seconds to get real-time updates
    const interval = setInterval(calculatePoints, 5000)
    return () => clearInterval(interval)
  }, [currentUser, notes])

  // Calculate stats
  const notesPosted = useMemo(() => {
    if (!currentUser) return 0
    return notes.filter(note => note.authorId === currentUser.uid).length
  }, [notes, currentUser])

  const notesFavorited = useMemo(() => {
    return userData?.favoritedPosts?.length || 0
  }, [userData?.favoritedPosts])

  // Calculate level based on points (every 250 points = 1 level)
  const level = Math.floor(totalPoints / 250) + 1
  const pointsInCurrentLevel = totalPoints % 250
  const pointsToNextLevel = 250 - pointsInCurrentLevel

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Calculating points...</p>
      </div>
    )
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
          <p className="text-sm text-purple-100 mt-2">
            Points = (Upvotes on your posts) - (Downvotes on your posts)
          </p>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{notesPosted}</div>
          <div className="text-sm text-gray-600">Notes Posted</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{notesFavorited}</div>
          <div className="text-sm text-gray-600">Notes Favorited</div>
        </div>
      </div>
    </div>
  )
}

export default TotalPoints
