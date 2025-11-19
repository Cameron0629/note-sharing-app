import { createContext, useContext, useState, useCallback } from 'react'

const NotesContext = createContext()

// Initial sample notes
const initialNotes = [
  {
    id: 1,
    title: 'Lecture 1: Introduction to Algorithms',
    author: 'John Doe',
    authorId: 'user2',
    content: 'Key concepts covered: time complexity, space complexity, Big O notation...',
    tags: ['lecture', 'algorithms'],
    date: '2024-01-15',
    courseId: 1
  },
  {
    id: 2,
    title: 'Midterm Study Guide',
    author: 'Jane Smith',
    authorId: 'user3',
    content: 'Comprehensive study guide covering chapters 1-5...',
    tags: ['study-guide', 'exam'],
    date: '2024-01-14',
    courseId: 1
  },
  {
    id: 3,
    title: 'Problem Set Solutions',
    author: 'Bob Johnson',
    authorId: 'user4',
    content: 'Solutions to problem set 3 with detailed explanations...',
    tags: ['homework', 'solutions'],
    date: '2024-01-13',
    courseId: 1
  }
]

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(initialNotes)
  const [nextId, setNextId] = useState(4) // Next available ID

  // Add a new note
  const addNote = useCallback((noteData) => {
    const newNote = {
      id: nextId,
      title: noteData.title,
      author: noteData.author || 'Current User',
      authorId: noteData.authorId || 'user1',
      content: noteData.description || noteData.content,
      tags: noteData.tags ? noteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      courseId: noteData.courseId,
      fileName: noteData.file ? noteData.file.name : null
    }
    
    setNotes(prevNotes => [newNote, ...prevNotes]) // Add to beginning for "most recent" order
    setNextId(prev => prev + 1)
    
    return newNote
  }, [nextId])

  // Get all notes
  const getAllNotes = useCallback(() => {
    return notes
  }, [notes])

  // Get notes for a specific course
  const getNotesByCourse = useCallback((courseId) => {
    return notes.filter(note => note.courseId === courseId)
  }, [notes])

  // Delete a note (for future use)
  const deleteNote = useCallback((noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
  }, [])

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        getAllNotes,
        getNotesByCourse,
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

