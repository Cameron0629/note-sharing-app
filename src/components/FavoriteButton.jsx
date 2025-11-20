import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function FavoriteButton({ noteId }) {
  const { currentUser, userData, updateUserData } = useAuth()
  const [isFavorited, setIsFavorited] = useState(
    userData?.favoritedPosts?.includes(noteId) || false
  )
  const [loading, setLoading] = useState(false)

  // Sync with userData changes
  useEffect(() => {
    setIsFavorited(userData?.favoritedPosts?.includes(noteId) || false)
  }, [userData?.favoritedPosts, noteId])

  const handleToggleFavorite = async () => {
    if (!currentUser || loading) return

    setLoading(true)
    try {
      const currentFavorites = userData?.favoritedPosts || []
      let updatedFavorites

      if (isFavorited) {
        // Remove from favorites
        updatedFavorites = currentFavorites.filter(id => id !== noteId)
      } else {
        // Add to favorites
        updatedFavorites = [...currentFavorites, noteId]
      }

      await updateUserData(currentUser.uid, {
        favoritedPosts: updatedFavorites
      })

      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error updating favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
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

export default FavoriteButton

