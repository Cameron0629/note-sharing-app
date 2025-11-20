import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, addDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const NotesContext = createContext()

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userData } = useAuth()

  // Listen to notes in Firestore, but only for courses in the user's school
  useEffect(() => {
    if (!currentUser || !userData?.schoolId) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    const notesRef = collection(db, 'notes')
    let unsubscribe
    
    // Filter notes by schoolId (stored in note document)
    const q = query(
      notesRef,
      where('schoolId', '==', userData.schoolId),
      orderBy('createdAt', 'desc')
    )

    const handleSnapshot = (snapshot) => {
      // Use a Map to prevent duplicates
      const notesMap = new Map()
      snapshot.docs.forEach(doc => {
        notesMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        })
      })
      const notesData = Array.from(notesMap.values())
      setNotes(notesData)
      setLoading(false)
    }

    unsubscribe = onSnapshot(
      q,
      handleSnapshot,
      (error) => {
        console.error('Error fetching notes:', error)
        // If index error, try without orderBy
        if (error.code === 'failed-precondition') {
          console.warn('Index not found, fetching without orderBy')
          const qNoOrder = query(
            notesRef,
            where('schoolId', '==', userData.schoolId)
          )
          unsubscribe = onSnapshot(qNoOrder, (snapshot) => {
            const notesMap = new Map()
            snapshot.docs.forEach(doc => {
              notesMap.set(doc.id, {
                id: doc.id,
                ...doc.data()
              })
            })
            const notesData = Array.from(notesMap.values())
            // Sort by createdAt manually
            notesData.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.date || 0)
              const dateB = new Date(b.createdAt || b.date || 0)
              return dateB - dateA
            })
            setNotes(notesData)
            setLoading(false)
          }, (err) => {
            console.error('Error fetching notes without orderBy:', err)
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      }
    )

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser, userData?.schoolId])

  // Add a new note to Firestore
  const addNote = useCallback(async (noteData) => {
    if (!currentUser || !userData) {
      throw new Error('User must be authenticated to post notes')
    }

    if (!userData.schoolId) {
      throw new Error('You must select a school before posting notes')
    }

    try {
      const noteDoc = {
        title: noteData.title,
        content: noteData.description || noteData.content,
        tags: noteData.tags ? noteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        courseId: noteData.courseId,
        schoolId: userData.schoolId, // Store schoolId in note for easier filtering
        authorId: currentUser.uid,
        author: userData.displayName || currentUser.email || 'Anonymous',
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        fileName: noteData.file ? noteData.file.name : null,
        fileUrl: null, // Will be set if file is uploaded to Storage
        votes: {} // Initialize votes field as empty object
      }

      const docRef = await addDoc(collection(db, 'notes'), noteDoc)
      
      // The real-time listener will automatically pick up the new note
      // No need to manually update the notes array
      
      return { id: docRef.id, ...noteDoc }
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  }, [currentUser, userData])

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        addNote
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
