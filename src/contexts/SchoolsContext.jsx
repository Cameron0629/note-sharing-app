import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const SchoolsContext = createContext()

/**
 * SchoolsContext.jsx - Schools context provider
 * 
 * This context manages all school data from Firestore.
 * Schools are public data and don't require authentication to view.
 * 
 * Used throughout the application:
 * - SchoolSelection component: Displays and manages school selection
 * - Leaderboard page: Filters leaderboard by school
 * - Profile page: Shows school selection tab
 * 
 * Provides:
 * - schools: Array of all schools from Firestore
 * - loading: Boolean indicating if schools are being loaded
 * - addSchool: Function to add a new school to Firestore
 * 
 * Firestore Collection: 'schools'
 * Document Structure:
 * - id: School document ID
 * - name: School name (required, unique)
 * - location: School location (optional)
 * - createdAt: ISO timestamp of creation
 * - createdBy: User ID who created the school
 */

export function SchoolsProvider({ children }) {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, loading: authLoading } = useAuth()

  useEffect(() => {
    // Schools are public data - load them immediately, don't wait for auth
    // This ensures schools are available as soon as possible, especially for new users
    setLoading(true)
    const schoolsRef = collection(db, 'schools')
    const q = query(schoolsRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
  }, []) // Remove authLoading dependency - schools should load immediately

  // Add a new school to Firestore
  const addSchool = useCallback(async (schoolData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to add schools')
    }

    if (!schoolData.name || !schoolData.name.trim()) {
      throw new Error('School name is required')
    }

    try {
      // Check if a school with the same name already exists (case-insensitive)
      const schoolsRef = collection(db, 'schools')
      const existingSchoolsQuery = query(schoolsRef)
      const existingSchoolsSnapshot = await getDocs(existingSchoolsQuery)
      
      const normalizedNewName = schoolData.name.trim().toLowerCase()
      const existingSchool = existingSchoolsSnapshot.docs.find(doc => {
        const schoolName = doc.data().name?.trim().toLowerCase()
        return schoolName === normalizedNewName
      })

      if (existingSchool) {
        throw new Error(`A school with the name "${schoolData.name.trim()}" already exists`)
      }

      const schoolDoc = {
        name: schoolData.name.trim(),
        location: schoolData.location?.trim() || '',
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

