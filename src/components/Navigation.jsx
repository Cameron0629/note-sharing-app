import { Link, useLocation } from 'react-router-dom'
import { useCourse } from '../contexts/CourseContext'

function Navigation() {
  const location = useLocation()
  const { selectedCourse } = useCourse()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/course-selection"
              className="flex items-center px-4 text-xl font-bold text-blue-600 hover:text-blue-800"
            >
              NoteShare
            </Link>
            <div className="flex space-x-1 ml-8">
              <Link
                to="/course-selection"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/course-selection')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Course Selection
              </Link>
              <Link
                to="/browse-notes"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/browse-notes')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Browse Notes
              </Link>
              <Link
                to="/post-notes"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/post-notes')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Post Notes
              </Link>
              <Link
                to="/reels"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/reels')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Reels
              </Link>
              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          {selectedCourse && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Active Course:</span>
              <span className="text-sm font-semibold text-blue-600">{selectedCourse.name}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation

