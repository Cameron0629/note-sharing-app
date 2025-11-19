import { useState } from 'react'
import { useCourse } from '../contexts/CourseContext'
import { useNotes } from '../contexts/NotesContext'
import { useVoting } from '../contexts/VotingContext'
import CourseSelectionPrompt from '../components/CourseSelectionPrompt'
import { useNavigate } from 'react-router-dom'

function PostNotes() {
  const { selectedCourse } = useCourse()
  const { addNote } = useNotes()
  const { currentUserId } = useVoting()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    file: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add note to the context
    addNote({
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
      file: formData.file,
      courseId: selectedCourse.id,
      authorId: currentUserId,
      author: 'Current User' // In a real app, this would come from auth
    })

    setIsSubmitting(false)
    // Reset form
    setFormData({
      title: '',
      description: '',
      tags: '',
      file: null
    })
    // Show success message and navigate
    alert('Note posted successfully!')
    navigate('/browse-notes')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Post Notes</h1>
            <p className="text-gray-600">
              Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
            </p>
          </div>

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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Note'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/browse-notes')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
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

