import { createContext, useContext, useCallback } from 'react'
import { doc, updateDoc, getDoc, increment, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { useNotes } from './NotesContext'

const VotingContext = createContext()

export function VotingProvider({ children }) {
  const { currentUser } = useAuth()
  const { notes } = useNotes()

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

  const getUserVote = useCallback((itemId) => {
    if (!currentUser) return null
    
    const noteId = itemId.replace('note-', '')
    const note = notes.find(n => n.id === noteId)
    
    if (!note || !note.votes) return null
    
    return note.votes[currentUser.uid] || null
  }, [notes, currentUser])

  const vote = useCallback(async (itemId, authorId, courseId, voteType) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to vote')
    }

    if (currentUser.uid === authorId) {
      throw new Error('You cannot vote on your own post')
    }

    const noteId = itemId.replace('note-', '')
    const noteRef = doc(db, 'notes', noteId)
    const authorRef = doc(db, 'users', authorId)

    try {
      await runTransaction(db, async (transaction) => {
        const noteSnap = await transaction.get(noteRef)
        if (!noteSnap.exists()) {
          throw new Error('Note not found')
        }

        const authorSnap = await transaction.get(authorRef)
        const currentPoints = authorSnap.exists() ? (authorSnap.data().totalPoints || 0) : 0

        const noteData = noteSnap.data()
        const currentVotes = (noteData.votes && typeof noteData.votes === 'object' && !Array.isArray(noteData.votes)) 
          ? { ...noteData.votes } 
          : {}
        const currentVote = currentVotes[currentUser.uid]

        let pointChange = 0
        const updatedVotes = { ...currentVotes }

        if (currentVote === voteType) {
          delete updatedVotes[currentUser.uid]
          if (voteType === 'upvote') {
            pointChange = -1
          } else {
            pointChange = 1
          }
        } else if (currentVote) {
          updatedVotes[currentUser.uid] = voteType
          if (currentVote === 'upvote' && voteType === 'downvote') {
            pointChange = -2
          } else if (currentVote === 'downvote' && voteType === 'upvote') {
            pointChange = 2
          }
        } else {
          updatedVotes[currentUser.uid] = voteType
          if (voteType === 'upvote') {
            pointChange = 1
          } else {
            pointChange = -1
          }
        }

        transaction.update(noteRef, {
          votes: updatedVotes
        })

        if (pointChange !== 0) {
          transaction.update(authorRef, {
            totalPoints: currentPoints + pointChange
          })
        }
      })
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
