import { useState } from 'react'
import { useCourse } from '../contexts/CourseContext'
import { useCourses } from '../contexts/CoursesContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSchools } from '../contexts/SchoolsContext'

function CourseSelection() {
  const { selectedCourse, selectCourse } = useCourse()
  const { courses, loading, addCourse } = useCourses()
  const { userData } = useAuth()
  const { schools } = useSchools()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hasSchool = userData?.schoolId && userData.schoolId !== ''
  const userSchool = schools.find(s => s.id === userData?.schoolId)

  const handleCourseSelect = (course) => {
    selectCourse(course)
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!hasSchool) {
      setError('Please select a school first in your profile settings')
      return
    }
    
    if (!formData.code || !formData.name) {
      setError('Course code and name are required')
      return
    }

    setSubmitting(true)
    try {
      await addCourse(formData)
      setFormData({ code: '', name: '', department: '' })
      setShowAddForm(false)
    } catch (err) {
      setError(err.message || 'Failed to add course')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Selection</h1>
              <p className="text-gray-600">
                Select a course to browse notes, post content, and view reels for that course.
              </p>
              {!hasSchool && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ School Required:</strong> Please select a school in your{' '}
                    <button
                      onClick={() => navigate('/profile#school')}
                      className="text-yellow-900 underline font-semibold"
                    >
                      profile settings
                    </button>
                    {' '}before adding courses.
                  </p>
                </div>
              )}
              {hasSchool && userSchool && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>School:</strong> {userSchool.name}
                  </p>
                </div>
              )}
            </div>
            {hasSchool && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
              >
                {showAddForm ? 'Cancel' : '+ Add Course'}
              </button>
            )}
          </div>

          {showAddForm && hasSchool && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Course</h2>
              {userSchool && (
                <p className="text-sm text-gray-600 mb-4">
                  Adding course for: <strong>{userSchool.name}</strong>
                </p>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Course'}
                </button>
              </form>
            </div>
          )}

          {selectedCourse && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
              <p className="text-lg font-semibold text-blue-700">
                {selectedCourse.code} - {selectedCourse.name}
              </p>
            </div>
          )}

          {!hasSchool ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">Please select a school first.</p>
              <button
                onClick={() => navigate('/profile#school')}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors"
              >
                Go to School Selection
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">No courses available for your school yet.</p>
              <p className="text-gray-400">Be the first to add a course!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                    selectedCourse?.id === course.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{course.code}</h3>
                    {selectedCourse?.id === course.id && (
                      <span className="text-blue-500 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-gray-700 font-medium mb-1">{course.name}</p>
                  {course.department && (
                    <p className="text-sm text-gray-500">{course.department}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedCourse && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => navigate('/browse-notes')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
              >
                Browse Notes
              </button>
              <button
                onClick={() => navigate('/post-notes')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
              >
                Post Notes
              </button>
              <button
                onClick={() => navigate('/reels')}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors"
              >
                View Reels
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseSelection
