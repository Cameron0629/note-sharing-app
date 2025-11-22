/**
 * AuthContext.jsx - Authentication context provider
 * 
 * This context manages all authentication-related state and operations for the application.
 * It provides user authentication, user data from Firestore, and authentication methods.
 * 
 * Used throughout the application:
 * - All protected pages check authentication status
 * - Navigation component uses user data for display
 * - Profile page displays and updates user data
 * - Settings page manages user account
 * - All context providers depend on authentication state
 * 
 * Provides:
 * - currentUser: Firebase auth user object (null if not logged in)
 * - userData: User document from Firestore (displayName, bio, schoolId, totalPoints, etc.)
 * - loading: Boolean indicating if auth state is being determined
 * - error: Any authentication errors
 * - signup: Function to create new user account
 * - login: Function to sign in existing user
 * - logout: Function to sign out current user
 * - resendVerificationEmail: Function to resend email verification
 * - resetPassword: Function to send password reset email
 * - updateUserData: Function to update user document in Firestore
 * - changePassword: Function to change user password
 * - getUserData: Function to fetch user data from Firestore
 * 
 * Firestore Collection: 'users'
 * Document Structure:
 * - uid: User ID
 * - displayName: User's display name
 * - email: User's email
 * - bio: User's bio
 * - totalPoints: Total points from votes
 * - schoolId: Selected school ID
 * - favoritedPosts: Array of favorited note IDs
 * - favoritedCourses: Array of favorited course IDs
 * - postsCreated: Array of created note IDs
 * - profilePictureUrl: URL of profile picture
 * - profilePictureStoragePath: Storage path of profile picture
 * - admin: Boolean for admin status
 */

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
  const [currentUser, setCurrentUser] = useState(null) // Firebase auth user object
  const [userData, setUserData] = useState(null) // User document from Firestore
  const [loading, setLoading] = useState(true) // Loading state while checking auth
  const [error, setError] = useState(null) // Authentication errors

  /**
   * Fetch user data from Firestore
   * @param {string} uid - User ID
   * @returns {Object|null} User document data or null if not found
   */
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

  /**
   * Sign up new user
   * Creates Firebase auth account, sends verification email, and creates user document in Firestore
   * Used in: Signup page
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - Optional display name
   * @returns {Object} Firebase user object
   */
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

  /**
   * Sign in existing user
   * Used in: Login page
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Firebase user object
   */
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

  /**
   * Sign out current user
   * Used in: Navigation component, Profile page
   */
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

  /**
   * Resend email verification
   * Used in: VerifyEmail page
   * @returns {boolean} True if email was sent, false otherwise
   */
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

  /**
   * Send password reset email
   * Used in: ForgotPassword page
   * @param {string} email - User email
   * @returns {boolean} True if email was sent
   */
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

  /**
   * Update user document in Firestore
   * Used in: Settings page, Profile page (school/course selection)
   * @param {string} uid - User ID
   * @param {Object} data - Data to update (will be merged with existing data)
   */
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

  /**
   * Change user password
   * Requires re-authentication with current password
   * Used in: Settings page
   * @param {string} currentPassword - Current password for re-authentication
   * @param {string} newPassword - New password
   * @returns {boolean} True if password was changed
   */
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

  /**
   * Monitor authentication state changes
   * Automatically loads user data from Firestore when user signs in
   * Clears user data when user signs out
   * Runs on component mount and whenever getUserData changes
   */
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

