import { useState, useEffect } from 'react'
import { useSchools } from '../../contexts/SchoolsContext'
import { useAuth } from '../../contexts/AuthContext'

function SchoolSelection() {
  const { schools, loading, addSchool } = useSchools()
  const { currentUser, userData, updateUserData } = useAuth()
  const [selectedSchool, setSelectedSchool] = useState(userData?.schoolId || null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Sync selectedSchool with userData changes
  useEffect(() => {
    if (userData?.schoolId) {
      setSelectedSchool(userData.schoolId)
    }
  }, [userData?.schoolId])

  const handleSchoolSelect = async (school) => {
    if (!currentUser) return

    try {
      setSelectedSchool(school.id)
      await updateUserData(currentUser.uid, {
        schoolId: school.id
      })
    } catch (err) {
      console.error('Error updating school selection:', err)
      setError('Failed to update school selection')
    }
  }

  const handleAddSchool = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name) {
      setError('School name is required')
      return
    }

    setSubmitting(true)
    try {
      const newSchool = await addSchool(formData)
      setFormData({ name: '', location: '' })
      setShowAddForm(false)
      // Auto-select the newly added school
      await handleSchoolSelect(newSchool)
    } catch (err) {
      setError(err.message || 'Failed to add school')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading schools...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">School Selection</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors text-sm whitespace-nowrap self-start sm:self-auto"
        >
          {showAddForm ? 'Cancel' : '+ Add School'}
        </button>
      </div>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Select your school to connect with other students and access school-specific content.
      </p>

      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New School</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleAddSchool} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., State University"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., City, State"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add School'}
            </button>
          </form>
        </div>
      )}

      {selectedSchool && schools.find(s => s.id === selectedSchool) && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
          <p className="text-lg font-semibold text-purple-700">
            {schools.find(s => s.id === selectedSchool).name}
          </p>
        </div>
      )}

      {schools.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No schools available yet.</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to add a school!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSchoolSelect(school)}
              className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                selectedSchool === school.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{school.name}</h3>
                  {school.location && (
                    <p className="text-gray-600">{school.location}</p>
                  )}
                </div>
                {selectedSchool === school.id && (
                  <span className="text-purple-500 text-2xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SchoolSelection
