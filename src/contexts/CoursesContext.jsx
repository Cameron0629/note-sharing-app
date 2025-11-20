import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const CoursesContext = createContext()

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userData } = useAuth()

  // Listen to courses in Firestore
  useEffect(() => {
    if (!userData?.schoolId) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    const coursesRef = collection(db, 'courses')
    let unsubscribe
    
    // Try with orderBy first
    const q = query(
      coursesRef,
      where('schoolId', '==', userData.schoolId),
      orderBy('code', 'asc')
    )

    const handleSnapshot = (snapshot) => {
      // Use a Map to prevent duplicates by ID
      const coursesMap = new Map()
      snapshot.docs.forEach(doc => {
        coursesMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        })
      })
      const coursesData = Array.from(coursesMap.values())
      // Sort by code as a fallback (in case orderBy doesn't work)
      coursesData.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
      setCourses(coursesData)
      setLoading(false)
    }

    unsubscribe = onSnapshot(
      q,
      handleSnapshot,
      (error) => {
        console.error('Error fetching courses:', error)
        // If index error, try without orderBy
        if (error.code === 'failed-precondition') {
          console.warn('Index not found, fetching without orderBy')
          const qNoOrder = query(
            coursesRef,
            where('schoolId', '==', userData.schoolId)
          )
          unsubscribe = onSnapshot(qNoOrder, handleSnapshot, (err) => {
            console.error('Error fetching courses without orderBy:', err)
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
  }, [userData?.schoolId])

  // Add a new course to Firestore
  const addCourse = useCallback(async (courseData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to add courses')
    }

    if (!userData?.schoolId || userData.schoolId === '') {
      throw new Error('You must select a school before adding courses')
    }

    try {
      const courseDoc = {
        code: courseData.code,
        name: courseData.name,
        department: courseData.department || '',
        schoolId: userData.schoolId, // Required - must have schoolId
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      }

      const docRef = await addDoc(collection(db, 'courses'), courseDoc)
      return { id: docRef.id, ...courseDoc }
    } catch (error) {
      console.error('Error adding course:', error)
      throw error
    }
  }, [currentUser, userData])

  return (
    <CoursesContext.Provider
      value={{
        courses,
        loading,
        addCourse
      }}
    >
      {children}
    </CoursesContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CoursesContext)
  if (!context) {
    throw new Error('useCourses must be used within a CoursesProvider')
  }
  return context
}

