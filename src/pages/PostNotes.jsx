import { useState, useEffect } from 'react'
import { useCourse } from '../contexts/CourseContext'
import { useNotes } from '../contexts/NotesContext'
import { useAuth } from '../contexts/AuthContext'
import { useCourses } from '../contexts/CoursesContext'
import CourseSelectionPrompt from '../components/CourseSelectionPrompt'
import { useNavigate } from 'react-router-dom'

function PostNotes() {
  const { selectedCourse, clearCourse } = useCourse()
  const { addNote } = useNotes()
  const { currentUser, userData } = useAuth()
  const { courses } = useCourses()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    file: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Clear course if it doesn't belong to user's school
  useEffect(() => {
    if (selectedCourse && userData?.schoolId) {
      const course = courses.find(c => c.id === selectedCourse.id)
      if (!course || course.schoolId !== userData.schoolId) {
        clearCourse()
        navigate('/profile#courses')
      }
    }
  }, [selectedCourse, userData?.schoolId, courses, clearCourse, navigate])

  if (!userData?.schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">🏫</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">School Selection Required</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Please select a school in your profile settings to post notes.</p>
          <button
            onClick={() => navigate('/profile#school')}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors text-sm sm:text-base"
          >
            Go to School Selection
          </button>
        </div>
      </div>
    )
  }

  if (!selectedCourse) {
    return <CourseSelectionPrompt message="Please select a course to post notes." />
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await addNote({
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        file: formData.file,
        courseId: selectedCourse.id
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: '',
        file: null
      })
      
      // Navigate to browse notes
      navigate('/browse-notes')
    } catch (err) {
      setError(err.message || 'Failed to post note')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Post Notes</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter note title..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter note description or content..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., lecture, homework, study-guide"
              />
              <p className="mt-1 text-sm text-gray-500">Separate multiple tags with commas</p>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (Optional)
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              />
              {formData.file && (
                <p className="mt-2 text-sm text-gray-600">Selected: {formData.file.name}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Note'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/browse-notes')}
                className="flex-1 sm:flex-initial px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostNotes
