import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const VotingContext = createContext()

// Points configuration
const POINTS_PER_UPVOTE = 10
const POINTS_PER_DOWNVOTE = -2 // Negative points for downvotes

// Achievement thresholds
const ACHIEVEMENTS = [
  { id: 'first_upvote', name: 'First Upvote', description: 'Received your first upvote', points: 10, icon: '🎉' },
  { id: 'ten_upvotes', name: 'Popular Post', description: 'Received 10 upvotes on a post', points: 100, icon: '⭐' },
  { id: 'hundred_points', name: 'Centurion', description: 'Reached 100 total points', points: 100, icon: '🏆' },
  { id: 'five_hundred_points', name: 'Scholar', description: 'Reached 500 total points', points: 500, icon: '📚' },
  { id: 'thousand_points', name: 'Master Contributor', description: 'Reached 1000 total points', points: 1000, icon: '👑' },
  { id: 'top_contributor', name: 'Top Contributor', description: 'Became top contributor in a course', points: 0, icon: '🌟' }
]

export function VotingProvider({ children }) {
  // Store votes: { postId: { userId: 'upvote' | 'downvote' | null } }
  const [votes, setVotes] = useState({})
  
  // Store user points per course: { userId: { courseId: points } }
  const [userPoints, setUserPoints] = useState({})
  
  // Store user achievements: { userId: [achievementId] }
  const [userAchievements, setUserAchievements] = useState({})
  
  // Track pending achievement checks
  const pendingChecks = useRef([])
  
  // Current user ID (in a real app, this would come from auth)
  const currentUserId = 'user1' // Mock user ID
  
  // Check achievements after state updates
  useEffect(() => {
    if (pendingChecks.current.length > 0) {
      const check = pendingChecks.current.shift()
      checkAchievements(check.userId, check.courseId, check.itemId, check.voteType)
    }
  }, [votes, userPoints])

  // Get vote count for a post/reel
  const getVoteCount = useCallback((itemId) => {
    const itemVotes = votes[itemId] || {}
    const upvotes = Object.values(itemVotes).filter(v => v === 'upvote').length
    const downvotes = Object.values(itemVotes).filter(v => v === 'downvote').length
    return { upvotes, downvotes, net: upvotes - downvotes }
  }, [votes])

  // Get user's vote for a post/reel
  const getUserVote = useCallback((itemId) => {
    return votes[itemId]?.[currentUserId] || null
  }, [votes, currentUserId])

  // Vote on a post/reel
  const vote = useCallback((itemId, authorId, courseId, voteType) => {
    setVotes(prev => {
      const itemVotes = prev[itemId] || {}
      const currentVote = itemVotes[currentUserId]
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        const newVotes = { ...prev }
        if (newVotes[itemId]) {
          const updated = { ...newVotes[itemId] }
          delete updated[currentUserId]
          if (Object.keys(updated).length === 0) {
            delete newVotes[itemId]
          } else {
            newVotes[itemId] = updated
          }
        }
        
        // Remove points if unvoting
        if (voteType === 'upvote') {
          setUserPoints(prevPoints => {
            const userCoursePoints = prevPoints[authorId]?.[courseId] || 0
            const newPoints = Math.max(0, userCoursePoints - POINTS_PER_UPVOTE)
            return {
              ...prevPoints,
              [authorId]: {
                ...(prevPoints[authorId] || {}),
                [courseId]: newPoints
              }
            }
          })
        } else if (voteType === 'downvote') {
          setUserPoints(prevPoints => {
            const userCoursePoints = prevPoints[authorId]?.[courseId] || 0
            const newPoints = Math.max(0, userCoursePoints - Math.abs(POINTS_PER_DOWNVOTE))
            return {
              ...prevPoints,
              [authorId]: {
                ...(prevPoints[authorId] || {}),
                [courseId]: newPoints
              }
            }
          })
        }
        
        return newVotes
      }
      
      // If switching from one vote to another, update
      let pointsDelta = 0
      if (currentVote === 'upvote' && voteType === 'downvote') {
        pointsDelta = -POINTS_PER_UPVOTE + POINTS_PER_DOWNVOTE
      } else if (currentVote === 'downvote' && voteType === 'upvote') {
        pointsDelta = Math.abs(POINTS_PER_DOWNVOTE) + POINTS_PER_UPVOTE
      } else if (!currentVote) {
        // New vote
        pointsDelta = voteType === 'upvote' ? POINTS_PER_UPVOTE : POINTS_PER_DOWNVOTE
      }
      
      // Update points
      if (pointsDelta !== 0) {
        setUserPoints(prevPoints => {
          const userCoursePoints = prevPoints[authorId]?.[courseId] || 0
          const newPoints = Math.max(0, userCoursePoints + pointsDelta)
          return {
            ...prevPoints,
            [authorId]: {
              ...(prevPoints[authorId] || {}),
              [courseId]: newPoints
            }
          }
        })
      }
      
      return {
        ...prev,
        [itemId]: {
          ...itemVotes,
          [currentUserId]: voteType
        }
      }
    })
    
    // Queue achievement check
    pendingChecks.current.push({ userId: authorId, courseId, itemId, voteType })
  }, [currentUserId])

  // Check and award achievements
  const checkAchievements = useCallback((userId, courseId, itemId, voteType) => {
    // Get current state values
    const totalPoints = Object.values(userPoints[userId] || {}).reduce((sum, points) => sum + points, 0)
    const itemVotes = votes[itemId] || {}
    const upvoteCount = Object.values(itemVotes).filter(v => v === 'upvote').length
    
    setUserAchievements(prevAchievements => {
      const userAchs = prevAchievements[userId] || []
      const newAchievements = []
      
      // Check for first upvote achievement (when a post gets its first upvote)
      if (voteType === 'upvote' && upvoteCount === 1 && !userAchs.includes('first_upvote')) {
        newAchievements.push('first_upvote')
      }
      
      // Check for ten upvotes achievement (when a post reaches 10 upvotes)
      if (voteType === 'upvote' && upvoteCount === 10 && !userAchs.includes('ten_upvotes')) {
        newAchievements.push('ten_upvotes')
      }
      
      // Check point-based achievements
      ACHIEVEMENTS.forEach(achievement => {
        if (achievement.points > 0 && totalPoints >= achievement.points && !userAchs.includes(achievement.id)) {
          newAchievements.push(achievement.id)
        }
      })
      
      // Check top contributor achievement (user is #1 in the course)
      const courseLeaderboard = []
      Object.keys(userPoints).forEach(uid => {
        const points = userPoints[uid]?.[courseId] || 0
        if (points > 0) {
          courseLeaderboard.push({ userId: uid, points })
        }
      })
      courseLeaderboard.sort((a, b) => b.points - a.points)
      if (courseLeaderboard.length > 0 && courseLeaderboard[0].userId === userId && !userAchs.includes('top_contributor')) {
        newAchievements.push('top_contributor')
      }
      
      if (newAchievements.length > 0) {
        return {
          ...prevAchievements,
          [userId]: [...userAchs, ...newAchievements]
        }
      }
      
      return prevAchievements
    })
  }, [votes, userPoints])

  // Get user's total points across all courses
  const getUserTotalPoints = useCallback((userId) => {
    const userCoursePoints = userPoints[userId] || {}
    return Object.values(userCoursePoints).reduce((sum, points) => sum + points, 0)
  }, [userPoints])

  // Get user's points for a specific course
  const getUserCoursePoints = useCallback((userId, courseId) => {
    return userPoints[userId]?.[courseId] || 0
  }, [userPoints])

  // Get leaderboard for a course
  const getCourseLeaderboard = useCallback((courseId) => {
    const leaderboard = []
    Object.keys(userPoints).forEach(userId => {
      const points = userPoints[userId]?.[courseId] || 0
      if (points > 0) {
        leaderboard.push({ userId, points })
      }
    })
    return leaderboard.sort((a, b) => b.points - a.points)
  }, [userPoints])

  // Get user achievements
  const getUserAchievements = useCallback((userId) => {
    const achievementIds = userAchievements[userId] || []
    return ACHIEVEMENTS.filter(ach => achievementIds.includes(ach.id))
  }, [userAchievements])

  return (
    <VotingContext.Provider
      value={{
        vote,
        getVoteCount,
        getUserVote,
        getUserTotalPoints,
        getUserCoursePoints,
        getCourseLeaderboard,
        getUserAchievements,
        currentUserId,
        POINTS_PER_UPVOTE,
        POINTS_PER_DOWNVOTE
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider')
  }
  return context
}

