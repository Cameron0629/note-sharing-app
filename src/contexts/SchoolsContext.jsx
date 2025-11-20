import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { collection, addDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const SchoolsContext = createContext()

export function SchoolsProvider({ children }) {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Listen to schools in Firestore
  useEffect(() => {
    setLoading(true)
    const schoolsRef = collection(db, 'schools')
    const q = query(schoolsRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Use a Set to prevent duplicates by ID
        const schoolsMap = new Map()
        snapshot.docs.forEach(doc => {
          schoolsMap.set(doc.id, {
            id: doc.id,
            ...doc.data()
          })
        })
        const schoolsData = Array.from(schoolsMap.values())
        setSchools(schoolsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching schools:', error)
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  // Add a new school to Firestore
  const addSchool = useCallback(async (schoolData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to add schools')
    }

    try {
      const schoolDoc = {
        name: schoolData.name,
        location: schoolData.location || '',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      }

      const docRef = await addDoc(collection(db, 'schools'), schoolDoc)
      return { id: docRef.id, ...schoolDoc }
    } catch (error) {
      console.error('Error adding school:', error)
      throw error
    }
  }, [currentUser])

  return (
    <SchoolsContext.Provider
      value={{
        schools,
        loading,
        addSchool
      }}
    >
      {children}
    </SchoolsContext.Provider>
  )
}

export function useSchools() {
  const context = useContext(SchoolsContext)
  if (!context) {
    throw new Error('useSchools must be used within a SchoolsProvider')
  }
  return context
}

