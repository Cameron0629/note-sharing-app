import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sign up function - creates user document with your schema
  async function signup(email, password, displayName = '') {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Send verification email
      await sendEmailVerification(user)

      // Create user document in Firestore with your schema
      const userDoc = {
        uid: user.uid,
        displayName: displayName || '',
        email: user.email || '',
        totalPoints: 0,
        schoolId: '',
        favoritedPosts: [],
        postsCreated: []
      }

      await setDoc(doc(db, 'users', user.uid), userDoc)
      
      // Load the user data
      setUserData(userDoc)

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Logout function
  async function logout() {
    try {
      setError(null)
      await signOut(auth)
      setUserData(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Resend verification email
  async function resendVerificationEmail() {
    try {
      setError(null)
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser)
        return true
      }
      return false
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Get user data from Firestore
  async function getUserData(uid) {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (err) {
      console.error('Error getting user data:', err)
      return null
    }
  }

  // Update user data in Firestore
  async function updateUserData(uid, data) {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true })
      // Refresh local user data
      const updatedData = await getUserData(uid)
      setUserData(updatedData)
    } catch (err) {
      console.error('Error updating user data:', err)
      throw err
    }
  }

  // Monitor auth state and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Refresh token to get latest email verification status
          await user.reload()
          setCurrentUser(user)
          
          // Load user data from Firestore
          const data = await getUserData(user.uid)
          setUserData(data)
        } catch (err) {
          console.error('Error loading user data:', err)
          // Still set the user even if data load fails
          setCurrentUser(user)
        }
      } else {
        setCurrentUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    getUserData,
    updateUserData,
    error,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

