import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from './AuthContext'

const NotesContext = createContext()

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userData } = useAuth()

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
        const data = doc.data()
        // Ensure votes field always exists and is preserved correctly
        // If votes exists and is an object, use it; otherwise use empty object
        const votes = (data.votes && typeof data.votes === 'object' && !Array.isArray(data.votes)) 
          ? data.votes 
          : {}
        notesMap.set(doc.id, {
          id: doc.id,
          ...data,
          votes: votes
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
              const data = doc.data()
              // Ensure votes field always exists and is preserved correctly
              const votes = (data.votes && typeof data.votes === 'object' && !Array.isArray(data.votes)) 
                ? data.votes 
                : {}
              notesMap.set(doc.id, {
                id: doc.id,
                ...data,
                votes: votes
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
      let fileUrl = null
      let storagePath = null
      
      // Upload file to Firebase Storage if provided
      if (noteData.file) {
        storagePath = `notes/${currentUser.uid}/${Date.now()}_${noteData.file.name}`
        const fileRef = ref(storage, storagePath)
        await uploadBytes(fileRef, noteData.file)
        fileUrl = await getDownloadURL(fileRef)
      }

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
        fileUrl: fileUrl, // Store the download URL
        storagePath: storagePath, // Store the storage path for deletion
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

  // Update an existing note
  const updateNote = useCallback(async (noteId, noteData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to update notes')
    }

    try {
      const noteRef = doc(db, 'notes', noteId)
      const updateData = {
        title: noteData.title,
        content: noteData.content || noteData.description,
        tags: noteData.tags ? (Array.isArray(noteData.tags) ? noteData.tags : noteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)) : [],
        updatedAt: new Date().toISOString()
      }

      await updateDoc(noteRef, updateData)
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  }, [currentUser])

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to delete notes')
    }

    try {
      // Get the note first to check if user is author or admin
      const noteRef = doc(db, 'notes', noteId)
      const noteSnap = await getDoc(noteRef)
      
      if (!noteSnap.exists()) {
        throw new Error('Note not found')
      }

      const noteData = noteSnap.data()
      const isAdmin = userData?.admin === true
      const isAuthor = noteData.authorId === currentUser.uid

      // Only allow deletion if user is the author OR an admin
      if (!isAuthor && !isAdmin) {
        throw new Error('You do not have permission to delete this note')
      }
      
      // Delete file from Storage if it exists
      if (noteData.storagePath) {
        try {
          const fileRef = ref(storage, noteData.storagePath)
          await deleteObject(fileRef)
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continue with note deletion even if file deletion fails
        }
      }
      
      // Delete the note document
      await deleteDoc(noteRef)
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  }, [currentUser, userData])

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        addNote,
        updateNote,
        deleteNote
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
