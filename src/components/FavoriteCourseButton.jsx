import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

function FavoriteCourseButton({ courseId }) {
  const { currentUser, userData, updateUserData } = useAuth()
  const [loading, setLoading] = useState(false)

  const isFavorited = useMemo(() => 
    userData?.favoritedCourses?.includes(courseId) || false
  , [userData?.favoritedCourses, courseId])

  const handleToggleFavorite = useCallback(async () => {
    if (!currentUser || loading) return

    setLoading(true)
    try {
      const currentFavorites = userData?.favoritedCourses || []
      const updatedFavorites = isFavorited
        ? currentFavorites.filter(id => id !== courseId)
        : [...currentFavorites, courseId]

      await updateUserData(currentUser.uid, {
        favoritedCourses: updatedFavorites
      })
    } catch (error) {
      console.error('Error updating course favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, userData?.favoritedCourses, isFavorited, courseId, updateUserData, loading])

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleToggleFavorite()
      }}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      aria-label={isFavorited ? 'Remove course from favorites' : 'Add course to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-4 h-4"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}

export default FavoriteCourseButton

