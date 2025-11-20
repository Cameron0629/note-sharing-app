import { createContext, useContext, useCallback } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
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
    if (!note || !note.votes) {
      return { upvotes: 0, downvotes: 0, net: 0 }
    }

    const votes = note.votes || {}
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

  // Vote on a note
  const vote = useCallback(async (itemId, authorId, courseId, voteType) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to vote')
    }

    try {
      const noteId = itemId.replace('note-', '')
      const noteRef = doc(db, 'notes', noteId)
      
      const noteSnap = await getDoc(noteRef)
      if (!noteSnap.exists()) {
        throw new Error('Note not found')
      }

      const currentVotes = noteSnap.data().votes || {}
      const currentVote = currentVotes[currentUser.uid]

      const updatedVotes = { ...currentVotes }

      if (currentVote === voteType) {
        delete updatedVotes[currentUser.uid]
      } else {
        updatedVotes[currentUser.uid] = voteType
      }

      await updateDoc(noteRef, {
        votes: updatedVotes
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
