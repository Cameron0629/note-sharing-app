
/**
 * VerifyEmail.jsx - Email verification page
 * 
 * This page is shown to users who have signed up but haven't verified their email yet.
 * Users can resend verification emails and check their verification status.
 * 
 * Route: /verify-email (public route, but requires authentication)
 * Accessed from: Signup page (after successful registration)
 * 
 * Features:
 * - Displays user's email address
 * - Resend verification email button (with cooldown)
 * - Check verification status button
 * - Cancel verification button (signs out and returns to signup)
 * - Automatic redirect to profile when verified
 * 
 * Note: If user tries to go back to signup while authenticated but not verified,
 * they will be redirected back here. Use "Cancel Verification" to sign out and return to signup.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function VerifyEmail() {
  const { currentUser, resendVerificationEmail, logout } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [cooldown, setCooldown] = useState(0)
  const [cancelling, setCancelling] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is verified
    if (currentUser) {
      if (currentUser.emailVerified) {
        navigate('/profile')
      } else {
        setChecking(false)
      }
    } else {
      navigate('/login')
    }
  }, [currentUser, navigate])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another email.`)
      return
    }

    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resendVerificationEmail()
      setMessage('Verification email sent! Please check your inbox (and spam folder).')
      setCooldown(60) // 60 second cooldown
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before requesting another email. Check your spam folder if you haven\'t received the previous email.')
        setCooldown(300) // 5 minute cooldown for too many requests
      } else {
        setError(err.message || 'Failed to send verification email')
        setCooldown(60) // Regular cooldown
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setChecking(true)
    setError('')
    setMessage('')

    try {
      await currentUser.reload()
      if (currentUser.emailVerified) {
        setMessage('Email verified! Redirecting...')
        setTimeout(() => {
          navigate('/profile')
        }, 1500)
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (err) {
      setError(err.message || 'Failed to check verification status')
    } finally {
      setChecking(false)
    }
  }

  /**
   * Cancel verification - signs out user and returns to signup page
   * This allows users to sign up with a different email if they can't verify the current one
   */
  const handleCancelVerification = async () => {
    if (!window.confirm('Are you sure you want to cancel verification? You will be signed out and can sign up again with a different email.')) {
      return
    }

    setCancelling(true)
    setError('')
    setMessage('')

    try {
      await logout()
      navigate('/signup', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to cancel verification')
      setCancelling(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Checking verification status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-md w-full">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-6xl mb-4">📧</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">
            We've sent a verification email to <strong className="break-all">{currentUser?.email}</strong>
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Check your email inbox (and spam/junk folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return here and click "I've Verified"</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Note:</strong> Emails may take a few minutes to arrive. If you don't see it, check your spam folder.
            </p>
          </div>

          <button
            onClick={handleCheckVerification}
            className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold transition-colors"
          >
            I've Verified My Email
          </button>

          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Sending...' 
              : cooldown > 0 
                ? `Resend Email (Wait ${cooldown}s)`
                : 'Resend Verification Email'}
          </button>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleCancelVerification}
              disabled={cancelling}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Signing out...' : 'Cancel Verification'}
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Can't verify your email? Cancel to sign out and sign up with a different email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

