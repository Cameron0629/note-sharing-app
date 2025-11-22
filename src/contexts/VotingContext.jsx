import { createContext, useContext, useCallback } from 'react'
import { doc, updateDoc, getDoc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { useNotes } from './NotesContext'

const VotingContext = createContext()

export function VotingProvider({ children }) {
  const { currentUser } = useAuth()
  const { notes } = useNotes()

  // Get vote count for a note (from the note document)
  const getVoteCount = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId)
    if (!note?.votes) {
      return { upvotes: 0, downvotes: 0, net: 0 }
    }

    const votes = note.votes
    const upvotes = Object.values(votes).filter(v => v === 'upvote').length
    const downvotes = Object.values(votes).filter(v => v === 'downvote').length

    return { upvotes, downvotes, net: upvotes - downvotes }
  }, [notes])

  // Get user's vote for a note
  const getUserVote = useCallback((itemId) => {
    if (!currentUser) return null
    
    const noteId = itemId.replace('note-', '')
    const note = notes.find(n => n.id === noteId)
    
    if (!note || !note.votes) return null
    
    return note.votes[currentUser.uid] || null
  }, [notes, currentUser])

  // Vote on a note - updates both note document and author's totalPoints
  const vote = useCallback(async (itemId, authorId, courseId, voteType) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to vote')
    }

    // Prevent users from voting on their own posts
    if (currentUser.uid === authorId) {
      throw new Error('You cannot vote on your own post')
    }

    const noteId = itemId.replace('note-', '')
    const noteRef = doc(db, 'notes', noteId)
    const authorRef = doc(db, 'users', authorId)

    try {
      // Use a transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Read ALL documents first (required by Firestore transactions)
        const noteSnap = await transaction.get(noteRef)
        if (!noteSnap.exists()) {
          throw new Error('Note not found')
        }

        const authorSnap = await transaction.get(authorRef)
        const currentPoints = authorSnap.exists() ? (authorSnap.data().totalPoints || 0) : 0

        const noteData = noteSnap.data()
        // Ensure votes is an object
        const currentVotes = (noteData.votes && typeof noteData.votes === 'object' && !Array.isArray(noteData.votes)) 
          ? { ...noteData.votes } 
          : {}
        const currentVote = currentVotes[currentUser.uid]

        console.log('Voting (transaction):', { 
          noteId, 
          voteType, 
          currentVote, 
          currentVotesKeys: Object.keys(currentVotes),
          allVotes: currentVotes
        })

        // Calculate point change
        let pointChange = 0
        const updatedVotes = { ...currentVotes }

        if (currentVote === voteType) {
          // Removing vote (toggle off) - user clicked the same vote button again
          delete updatedVotes[currentUser.uid]
          if (voteType === 'upvote') {
            pointChange = -1 // Remove upvote = -1 point
          } else {
            pointChange = 1 // Remove downvote = +1 point (undo the -1)
          }
          console.log('Removing vote, pointChange:', pointChange)
        } else if (currentVote) {
          // Changing vote (upvote to downvote or vice versa)
          updatedVotes[currentUser.uid] = voteType
          if (currentVote === 'upvote' && voteType === 'downvote') {
            pointChange = -2 // Was +1, now -1, so net -2
          } else if (currentVote === 'downvote' && voteType === 'upvote') {
            pointChange = 2 // Was -1, now +1, so net +2
          }
          console.log('Changing vote, pointChange:', pointChange)
        } else {
          // New vote - this is the case we want for first-time upvote
          updatedVotes[currentUser.uid] = voteType
          if (voteType === 'upvote') {
            pointChange = 1 // New upvote = +1 point
          } else {
            pointChange = -1 // New downvote = -1 point
          }
          console.log('New vote, pointChange:', pointChange, 'updatedVotes:', updatedVotes)
        }

        // Now do ALL writes (after all reads are complete)
        transaction.update(noteRef, {
          votes: updatedVotes
        })

        // Update author's totalPoints in transaction
        if (pointChange !== 0) {
          transaction.update(authorRef, {
            totalPoints: currentPoints + pointChange
          })
          console.log('Author points will be updated from', currentPoints, 'to', currentPoints + pointChange)
        }
      })

      console.log('Transaction completed successfully')
    } catch (error) {
      console.error('Error voting:', error)
      throw error
    }
  }, [currentUser])

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
