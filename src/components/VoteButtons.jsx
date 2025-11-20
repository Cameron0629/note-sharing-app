import { useVoting } from '../contexts/VotingContext'
import { useAuth } from '../contexts/AuthContext'

function VoteButtons({ itemId, authorId, courseId }) {
  const { vote, getVoteCount, getUserVote } = useVoting()
  const { currentUser } = useAuth()
  const noteId = itemId.replace('note-', '')
  const voteCount = getVoteCount(noteId)
  const userVote = getUserVote(itemId)
  const isDisabled = !currentUser || currentUser.uid === authorId

  const handleUpvote = async () => {
    if (isDisabled) return
    try {
      await vote(itemId, authorId, courseId, 'upvote')
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handleDownvote = async () => {
    if (isDisabled) return
    try {
      await vote(itemId, authorId, courseId, 'downvote')
    } catch (error) {
      console.error('Error downvoting:', error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUpvote}
        disabled={isDisabled}
        className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
          userVote === 'upvote'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label="Upvote"
        title={isDisabled ? (currentUser?.uid === authorId ? "You can't vote on your own post" : "Please log in to vote") : "Upvote"}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span className="font-semibold">{voteCount.upvotes}</span>
      </button>
      <button
        onClick={handleDownvote}
        disabled={isDisabled}
        className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
          userVote === 'downvote'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label="Downvote"
        title={isDisabled ? (currentUser?.uid === authorId ? "You can't vote on your own post" : "Please log in to vote") : "Downvote"}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.834a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
        <span className="font-semibold">{voteCount.downvotes}</span>
      </button>
      <div className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
        <span className="font-medium">{voteCount.net > 0 ? '+' : ''}{voteCount.net}</span>
        <span className="text-gray-400 ml-1">net</span>
      </div>
    </div>
  )
}

export default VoteButtons
