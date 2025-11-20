import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'

function TotalPoints() {
  const { currentUser, userData } = useAuth()
  const { notes } = useNotes()
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(false)

  // Calculate points from votes on user's notes
  useEffect(() => {
    if (!currentUser) {
      setTotalPoints(0)
      return
    }

    setLoading(true)
    try {
      const userNotes = notes.filter(note => note.authorId === currentUser.uid)
      
      if (userNotes.length === 0) {
        setTotalPoints(0)
        setLoading(false)
        return
      }

      let totalUpvotes = 0
      let totalDownvotes = 0

      userNotes.forEach(note => {
        if (note.votes) {
          const votes = Object.values(note.votes)
          totalUpvotes += votes.filter(v => v === 'upvote').length
          totalDownvotes += votes.filter(v => v === 'downvote').length
        }
      })

      const points = totalUpvotes - totalDownvotes
      setTotalPoints(Math.max(0, points))
    } catch (error) {
      console.error('Error calculating points:', error)
      setTotalPoints(0)
    } finally {
      setLoading(false)
    }
  }, [currentUser, notes])

  const notesPosted = useMemo(() => {
    if (!currentUser) return 0
    return notes.filter(note => note.authorId === currentUser.uid).length
  }, [notes, currentUser])

  const notesFavorited = useMemo(() => {
    return userData?.favoritedPosts?.length || 0
  }, [userData?.favoritedPosts])

  const level = Math.floor(totalPoints / 250) + 1

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
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Total Points</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Track your progress and achievements</p>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 sm:p-8 text-white mb-4 sm:mb-6">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl font-bold mb-2">{totalPoints}</div>
          <div className="text-lg sm:text-xl mb-4">Total Points</div>
          <div className="text-base sm:text-lg mb-2">Level {level}</div>
          <p className="text-xs sm:text-sm text-purple-100 mt-2">
            Points = (Upvotes on your posts) - (Downvotes on your posts)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <div className="text-xl sm:text-2xl font-bold text-blue-700">{notesPosted}</div>
          <div className="text-xs sm:text-sm text-gray-600">Notes Posted</div>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
          <div className="text-xl sm:text-2xl font-bold text-green-700">{notesFavorited}</div>
          <div className="text-xs sm:text-sm text-gray-600">Notes Favorited</div>
        </div>
      </div>
    </div>
  )
}

export default TotalPoints
