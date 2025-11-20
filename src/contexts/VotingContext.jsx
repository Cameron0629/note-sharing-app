import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const VotingContext = createContext()

export function VotingProvider({ children }) {
  const { currentUser } = useAuth()
  const [votes, setVotes] = useState({}) // { itemId: { userId: 'upvote' | 'downvote' } }

  // Load votes from Firestore
  useEffect(() => {
    if (!currentUser) {
      setVotes({})
      return
    }

    const votesRef = collection(db, 'votes')
    const q = query(votesRef, where('userId', '==', currentUser.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votesData = {}
      snapshot.docs.forEach(doc => {
        const voteData = doc.data()
        const itemId = voteData.noteId || voteData.reelId
        if (itemId) {
          if (!votesData[itemId]) {
            votesData[itemId] = {}
          }
          votesData[itemId][currentUser.uid] = voteData.type
        }
      })
      setVotes(votesData)
    }, (error) => {
      console.error('Error loading votes:', error)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Get vote count for a post/reel (from all users)
  const getVoteCount = useCallback(async (itemId) => {
    try {
      const votesRef = collection(db, 'votes')
      // Extract the actual note/reel ID (remove prefix)
      const actualId = itemId.replace('note-', '').replace('reel-', '')
      const isNote = itemId.startsWith('note-')
      
      let snapshot
      if (isNote) {
        const q = query(votesRef, where('noteId', '==', actualId))
        snapshot = await getDocs(q)
      } else {
        const q = query(votesRef, where('reelId', '==', actualId))
        snapshot = await getDocs(q)
      }

      const allVotes = snapshot.docs.map(doc => doc.data())
      const upvotes = allVotes.filter(v => v.type === 'upvote').length
      const downvotes = allVotes.filter(v => v.type === 'downvote').length

      return { upvotes, downvotes, net: upvotes - downvotes }
    } catch (error) {
      console.error('Error getting vote count:', error)
      return { upvotes: 0, downvotes: 0, net: 0 }
    }
  }, [])

  // Get user's vote for a post/reel
  const getUserVote = useCallback((itemId) => {
    return votes[itemId]?.[currentUser?.uid] || null
  }, [votes, currentUser])

  // Vote on a post/reel
  const vote = useCallback(async (itemId, authorId, courseId, voteType) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to vote')
    }

    try {
      const voteId = `${itemId}_${currentUser.uid}`
      const voteRef = doc(db, 'votes', voteId)
      const currentVote = votes[itemId]?.[currentUser.uid]

      // If clicking the same vote type, remove the vote (unvote)
      if (currentVote === voteType) {
        await deleteDoc(voteRef)
      } else {
        // Determine if it's a note or reel based on itemId prefix
        const isNote = itemId.startsWith('note-')
        const voteData = {
          userId: currentUser.uid,
          type: voteType,
          authorId,
          courseId,
          createdAt: new Date().toISOString()
        }

        if (isNote) {
          voteData.noteId = itemId.replace('note-', '')
          voteData.itemId = itemId // Store full itemId for easier querying
        } else {
          voteData.reelId = itemId.replace('reel-', '')
          voteData.itemId = itemId
        }

        await setDoc(voteRef, voteData)
      }
    } catch (error) {
      console.error('Error voting:', error)
      throw error
    }
  }, [currentUser, votes])

  return (
    <VotingContext.Provider
      value={{
        vote,
        getVoteCount,
        getUserVote,
        currentUserId: currentUser?.uid
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
