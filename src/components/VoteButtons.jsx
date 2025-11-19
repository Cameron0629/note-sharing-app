import { useVoting } from '../contexts/VotingContext'

function VoteButtons({ itemId, authorId, courseId }) {
  const { vote, getVoteCount, getUserVote } = useVoting()
  const voteCount = getVoteCount(itemId)
  const userVote = getUserVote(itemId)

  const handleUpvote = () => {
    vote(itemId, authorId, courseId, 'upvote')
  }

  const handleDownvote = () => {
    vote(itemId, authorId, courseId, 'downvote')
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUpvote}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
          userVote === 'upvote'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
        aria-label="Upvote"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-semibold">{voteCount.upvotes}</span>
      </button>
      <button
        onClick={handleDownvote}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
          userVote === 'downvote'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
        aria-label="Downvote"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-semibold">{voteCount.downvotes}</span>
      </button>
      <div className="ml-2 text-sm text-gray-600">
        <span className="font-medium">{voteCount.net > 0 ? '+' : ''}{voteCount.net}</span>
        <span className="text-gray-400 ml-1">net</span>
      </div>
    </div>
  )
}

export default VoteButtons

