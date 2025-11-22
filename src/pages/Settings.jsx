import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

function Settings() {
  const navigate = useNavigate()
  const { currentUser, userData, updateUserData, changePassword } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Username/Display Name form
  const [displayName, setDisplayName] = useState(userData?.displayName || '')
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Profile picture form
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(userData?.profilePictureUrl || null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const fileInputRef = useRef(null)

  // Sync profile picture preview with userData
  useEffect(() => {
    if (!profilePictureFile) {
      setProfilePicturePreview(userData?.profilePictureUrl || null)
    }
  }, [userData?.profilePictureUrl, profilePictureFile])

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!displayName.trim()) {
        throw new Error('Display name cannot be empty')
      }

      await updateUserData(currentUser.uid, {
        displayName: displayName.trim()
      })
      setSuccess('Display name updated successfully!')
      setDisplayName(displayName.trim())
    } catch (err) {
      setError(err.message || 'Failed to update display name')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setProfilePictureFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) {
      setError('Please select an image to upload')
      return
    }

    setError('')
    setSuccess('')
    setUploadingPicture(true)

    try {
      // Delete old profile picture if it exists
      if (userData?.profilePictureUrl && userData?.profilePictureStoragePath) {
        try {
          const oldFileRef = ref(storage, userData.profilePictureStoragePath)
          await deleteObject(oldFileRef)
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError)
          // Continue even if deletion fails
        }
      }

      // Upload new profile picture
      const storagePath = `profile-pictures/${currentUser.uid}/${Date.now()}_${profilePictureFile.name}`
      const fileRef = ref(storage, storagePath)
      await uploadBytes(fileRef, profilePictureFile)
      const downloadURL = await getDownloadURL(fileRef)

      // Update user data
      await updateUserData(currentUser.uid, {
        profilePictureUrl: downloadURL,
        profilePictureStoragePath: storagePath
      })

      setSuccess('Profile picture updated successfully!')
      setProfilePictureFile(null)
      setProfilePicturePreview(downloadURL)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    if (!userData?.profilePictureUrl) {
      return
    }

    setError('')
    setSuccess('')
    setUploadingPicture(true)

    try {
      // Delete from storage
      if (userData?.profilePictureStoragePath) {
        try {
          const fileRef = ref(storage, userData.profilePictureStoragePath)
          await deleteObject(fileRef)
        } catch (deleteError) {
          console.error('Error deleting profile picture:', deleteError)
        }
      }

      // Update user data
      await updateUserData(currentUser.uid, {
        profilePictureUrl: '',
        profilePictureStoragePath: ''
      })

      setSuccess('Profile picture removed successfully!')
      setProfilePicturePreview(null)
      setProfilePictureFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.message || 'Failed to remove profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const isAdmin = userData?.admin === true

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/profile')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Profile</span>
          </button>

          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6">Settings</h1>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Account Settings Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Account Settings</h2>
            
            {/* Profile Picture */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Profile Picture Preview */}
                <div className="flex-shrink-0">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                      <span className="text-2xl font-bold text-blue-700">
                        {(userData?.displayName || currentUser?.email?.split('@')[0] || 'U')
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Picture
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {profilePictureFile && (
                      <button
                        onClick={handleUploadProfilePicture}
                        disabled={uploadingPicture}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                      </button>
                    )}
                    {userData?.profilePictureUrl && (
                      <button
                        onClick={handleRemoveProfilePicture}
                        disabled={uploadingPicture}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPicture ? 'Removing...' : 'Remove Picture'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Display Name */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Display Name</h3>
              <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your display name"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || displayName.trim() === (userData?.displayName || '')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Display Name'}
                </button>
              </form>
            </div>

            {/* Password Change */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Admin Controls Section */}
          {isAdmin && (
            <div className="mb-8 pt-8 border-t border-gray-300">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Admin Controls</h2>
              <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-gray-700">Admin controls will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

