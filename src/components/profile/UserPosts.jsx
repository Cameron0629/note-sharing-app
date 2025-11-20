import { useState, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import { useCourses } from '../../contexts/CoursesContext'
import { useNavigate } from 'react-router-dom'

function UserPosts() {
  const { currentUser, userData } = useAuth()
  const { notes } = useNotes()
  const { courses } = useCourses()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('my-posts')

  // Get user's posts
  const myPosts = useMemo(() => {
    if (!currentUser) return []
    return notes
      .filter(note => note.authorId === currentUser.uid)
      .map(note => {
        const course = courses.find(c => c.id === note.courseId)
        return {
          ...note,
          course: course ? `${course.code} - ${course.name}` : 'Unknown Course'
        }
      })
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [notes, currentUser, courses])

  // Get favorited posts
  const favoritedPosts = useMemo(() => {
    const favoritedIds = userData?.favoritedPosts || []
    return notes
      .filter(note => favoritedIds.includes(note.id))
      .map(note => {
        const course = courses.find(c => c.id === note.courseId)
        return {
          ...note,
          course: course ? `${course.code} - ${course.name}` : 'Unknown Course'
        }
      })
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [notes, userData?.favoritedPosts, courses])

  const activePosts = activeView === 'my-posts' ? myPosts : favoritedPosts

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Posts</h2>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('my-posts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'my-posts'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveView('favorited')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'favorited'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Favorited Posts ({favoritedPosts.length})
          </button>
        </div>
      </div>

      {activePosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-base sm:text-lg">
            {activeView === 'my-posts'
              ? "You haven't posted any notes yet."
              : "You haven't favorited any posts yet."}
          </p>
          {activeView === 'my-posts' && (
            <button
              onClick={() => navigate('/post-notes')}
              className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors text-sm sm:text-base"
            >
              Post Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activePosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 break-words">{post.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="font-medium truncate">{post.course}</span>
                    <span className="whitespace-nowrap">{post.date || post.createdAt?.split('T')[0]}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                </div>
                {activeView === 'my-posts' && (
                  <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/browse-notes`)}
                      className="px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap"
                    >
                      View
                    </button>
                  </div>
                )}
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
