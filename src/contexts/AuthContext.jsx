import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get user data from Firestore
  const getUserData = useCallback(async (uid) => {
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
  }, [])

  // Sign up function - creates user document with your schema
  const signup = useCallback(async (email, password, displayName = '') => {
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
        bio: '',
        totalPoints: 0,
        schoolId: '',
        favoritedPosts: [],
        favoritedCourses: [],
        postsCreated: [],
        profilePictureUrl: '',
        profilePictureStoragePath: '',
        admin: false // Default to false, can be set to true in Firebase Console
      }

      await setDoc(doc(db, 'users', user.uid), userDoc)
      setUserData(userDoc)

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setError(null)
      await signOut(auth)
      setUserData(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Resend verification email
  const resendVerificationEmail = useCallback(async () => {
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
  }, [currentUser])

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Update user data in Firestore
  const updateUserData = useCallback(async (uid, data) => {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true })
      const updatedData = await getUserData(uid)
      setUserData(updatedData)
    } catch (err) {
      console.error('Error updating user data:', err)
      throw err
    }
  }, [getUserData])

  // Update password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to change password')
    }

    try {
      setError(null)
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      // Update password
      await updatePassword(currentUser, newPassword)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [currentUser])

  // Monitor auth state and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.reload()
          setCurrentUser(user)
          const data = await getUserData(user.uid)
          setUserData(data)
        } catch (err) {
          console.error('Error loading user data:', err)
          setCurrentUser(user)
        }
      } else {
        setCurrentUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [getUserData])

  const value = useMemo(() => ({
    currentUser,
    userData,
    signup,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    getUserData,
    updateUserData,
    changePassword,
    error,
    loading
  }), [currentUser, userData, signup, login, logout, resendVerificationEmail, resetPassword, getUserData, updateUserData, changePassword, error, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

