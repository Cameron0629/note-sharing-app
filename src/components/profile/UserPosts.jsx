import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import { useCourse } from '../../contexts/CourseContext'
import { useNavigate } from 'react-router-dom'

function UserPosts() {
  const { currentUser, userData } = useAuth()
  const { notes } = useNotes()
  const { selectedCourse } = useCourse()
  const navigate = useNavigate()

  const myPosts = useMemo(() => {
    if (!currentUser || !selectedCourse || !userData?.schoolId) return []
    return notes
      .filter(note => 
        note.authorId === currentUser.uid &&
        note.courseId === selectedCourse.id &&
        note.schoolId === userData.schoolId
      )
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [notes, currentUser, selectedCourse, userData?.schoolId])

  if (!currentUser || !selectedCourse || !userData?.schoolId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-base sm:text-lg text-gray-500 mb-4">Please select a school and course to view your posts.</p>
        <button
          onClick={() => navigate('/profile#courses')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm sm:text-base"
        >
          Go to Course Selection
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Posts</h2>
        <span className="text-sm text-gray-500">({myPosts.length})</span>
      </div>

      {myPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-base sm:text-lg text-gray-500 mb-4">You haven't posted any notes for this course yet.</p>
          <button
            onClick={() => navigate('/post-notes')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors text-sm sm:text-base"
          >
            Post Your First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 break-words">{post.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="font-medium">{selectedCourse.code}</span>
                    <span className="whitespace-nowrap">{post.date || post.createdAt?.split('T')[0]}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{post.content}</p>
                </div>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserPosts
