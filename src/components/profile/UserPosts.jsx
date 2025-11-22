import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import { useCourse } from '../../contexts/CourseContext'
import { useCourses } from '../../contexts/CoursesContext'
import { useNavigate } from 'react-router-dom'

function UserPosts() {
  const { currentUser, userData } = useAuth()
  const { notes, deleteNote } = useNotes()
  const { selectedCourse, selectCourse } = useCourse()
  const { courses } = useCourses()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourseId, setFilterCourseId] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState(null)

  // Initialize filterCourseId with selectedCourse when it changes
  useEffect(() => {
    if (selectedCourse?.id && filterCourseId === '') {
      setFilterCourseId(selectedCourse.id)
    }
  }, [selectedCourse?.id, filterCourseId])

  const myPosts = useMemo(() => {
    if (!currentUser || !userData?.schoolId) return []
    
    // If filterCourseId is empty string (All Courses selected), use null; if it has a value, use it; otherwise use selectedCourse
    const courseIdToFilter = filterCourseId === '' ? null : (filterCourseId || selectedCourse?.id || null)
    
    let filtered = notes.filter(note => 
      note.authorId === currentUser.uid &&
      note.schoolId === userData.schoolId &&
      (!courseIdToFilter || note.courseId === courseIdToFilter)
    )
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [notes, currentUser, selectedCourse, userData?.schoolId, filterCourseId, searchQuery])

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    setDeletingNoteId(noteId)
    try {
      await deleteNote(noteId)
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    } finally {
      setDeletingNoteId(null)
    }
  }

  if (!currentUser || !userData?.schoolId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-base sm:text-lg text-gray-500 mb-4">Please select a school to view your posts.</p>
        <button
          onClick={() => navigate('/profile#school')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm sm:text-base"
        >
          Go to School Selection
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

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course:</label>
          <select
            value={filterCourseId}
            onChange={(e) => {
              setFilterCourseId(e.target.value)
              if (e.target.value) {
                const course = courses.find(c => c.id === e.target.value)
                if (course) selectCourse(course)
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Courses</option>
            {courses.filter(c => c.schoolId === userData?.schoolId).map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
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
              onClick={() => navigate(`/note/${post.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words flex-1">{post.title}</h3>
                    <button
                      onClick={(e) => handleDeleteNote(post.id, e)}
                      disabled={deletingNoteId === post.id}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50 flex-shrink-0"
                      title="Delete note"
                    >
                      {deletingNoteId === post.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="font-medium">{courses.find(c => c.id === post.courseId)?.code || 'Unknown Course'}</span>
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
