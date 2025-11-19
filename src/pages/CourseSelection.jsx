import { useCourse } from '../contexts/CourseContext'
import { useNavigate } from 'react-router-dom'

function CourseSelection() {
  const { selectedCourse, selectCourse } = useCourse()
  const navigate = useNavigate()

  // Sample courses - in a real app, this would come from an API
  const courses = [
    { id: 1, code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science' },
    { id: 2, code: 'MATH201', name: 'Calculus II', department: 'Mathematics' },
    { id: 3, code: 'PHYS150', name: 'Physics for Engineers', department: 'Physics' },
    { id: 4, code: 'ENG101', name: 'Composition and Rhetoric', department: 'English' },
    { id: 5, code: 'CHEM120', name: 'General Chemistry', department: 'Chemistry' },
    { id: 6, code: 'BIO200', name: 'Cell Biology', department: 'Biology' }
  ]

  const handleCourseSelect = (course) => {
    selectCourse(course)
    // Optionally navigate to browse notes after selection
    // navigate('/browse-notes')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Selection</h1>
          <p className="text-gray-600 mb-6">
            Select a course to browse notes, post content, and view reels for that course.
          </p>

          {selectedCourse && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
              <p className="text-lg font-semibold text-blue-700">
                {selectedCourse.code} - {selectedCourse.name}
              </p>
            </div>
          )}

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
                <p className="text-sm text-gray-500">{course.department}</p>
              </button>
            ))}
          </div>

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

