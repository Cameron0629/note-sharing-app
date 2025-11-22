import { useState, useMemo, useEffect } from 'react'
import { useCourse } from '../contexts/CourseContext'
import { useNotes } from '../contexts/NotesContext'
import { useAuth } from '../contexts/AuthContext'
import { useCourses } from '../contexts/CoursesContext'
import VoteButtons from '../components/VoteButtons'
import FavoriteButton from '../components/FavoriteButton'
import { useNavigate } from 'react-router-dom'

function BrowseNotes() {
  const { selectedCourse, clearCourse, selectCourse } = useCourse()
  const { notes, loading, deleteNote } = useNotes()
  const { currentUser, userData } = useAuth()
  const { courses } = useCourses()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [filterCourseId, setFilterCourseId] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [deletingNoteId, setDeletingNoteId] = useState(null)

  // Initialize filterCourseId with selectedCourse when it changes
  useEffect(() => {
    if (selectedCourse?.id && filterCourseId === '') {
      setFilterCourseId(selectedCourse.id)
    }
  }, [selectedCourse?.id, filterCourseId])

  // Clear selected course if it doesn't belong to current school
  useEffect(() => {
    if (selectedCourse && userData?.schoolId) {
      const course = courses.find(c => c.id === selectedCourse.id)
      if (!course || course.schoolId !== userData.schoolId) {
        clearCourse()
      }
    }
  }, [selectedCourse, userData?.schoolId, courses, clearCourse])

  if (!userData?.schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">🏫</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">School Selection Required</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Please select a school in your profile settings to view notes.</p>
          <button
            onClick={() => navigate('/profile#school')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors text-sm sm:text-base"
          >
            Go to School Selection
          </button>
        </div>
      </div>
    )
  }


  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    // If filterCourseId is empty string (All Courses selected), use null; if it has a value, use it; otherwise use selectedCourse
    const courseIdToFilter = filterCourseId === '' ? null : (filterCourseId || selectedCourse?.id || null)
    
    let filtered = notes.filter((note) => {
      const matchesCourse = !courseIdToFilter || note.courseId === courseIdToFilter
      const matchesSearch =
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = filterTag === 'all' || (note.tags && note.tags.includes(filterTag))

      return matchesCourse && matchesSearch && matchesTag
    })

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date) // Most recent first
        case 'oldest':
          return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date) // Oldest first
        case 'title':
          return (a.title || '').localeCompare(b.title || '') // A-Z
        case 'author':
          return (a.author || '').localeCompare(b.author || '') // A-Z
        default:
          return 0
      }
    })

    return sorted
  }, [notes, selectedCourse?.id, filterCourseId, searchQuery, filterTag, sortBy])

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

  // Get all unique tags for filter
  const allTags = useMemo(() => {
    const courseIdToFilter = filterCourseId || selectedCourse?.id
    const courseNotes = courseIdToFilter 
      ? notes.filter(note => note.courseId === courseIdToFilter)
      : notes
    const tags = courseNotes.flatMap((note) => note.tags || [])
    return ['all', ...new Set(tags)]
  }, [notes, selectedCourse?.id, filterCourseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Browse Notes</h1>
                <p className="text-sm sm:text-base text-gray-600">
              {filterCourseId ? (
                <>Course: <span className="font-semibold">{courses.find(c => c.id === filterCourseId)?.code || ''} - {courses.find(c => c.id === filterCourseId)?.name || ''}</span></>
              ) : selectedCourse ? (
                <>Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span> (or filter below)</>
              ) : (
                <>No course selected - Showing all notes. Filter by course below to narrow results.</>
              )}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search notes by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filtering Controls */}
          <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Courses</option>
                {courses.filter(c => c.schoolId === userData?.schoolId).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tag:</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All Tags' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="author">Author A-Z</option>
              </select>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-base sm:text-lg text-gray-500">No notes found matching your criteria.</p>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-2">No notes have been posted yet.</p>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or selecting a different course.</p>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isOwner = currentUser && note.authorId === currentUser.uid
                return (
                <div
                  key={note.id}
                  onClick={() => navigate(`/note/${note.id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex-1">{note.title}</h2>
                      {isOwner && (
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          disabled={deletingNoteId === note.id}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50 flex-shrink-0"
                          title="Delete note"
                        >
                          {deletingNoteId === note.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{note.date || note.createdAt?.split('T')[0]}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">{note.content}</p>
                  {note.fileName && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-blue-900">📎 Attached file: </span>
                          {note.fileUrl ? (
                            <a
                              href={note.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-medium text-blue-700 break-words hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {note.fileName}
                            </a>
                          ) : (
                            <span className="text-xs sm:text-sm font-medium text-blue-700 break-words">{note.fileName}</span>
                          )}
                          {note.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Image</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {note.tags && note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="text-xs sm:text-sm text-gray-500">By {note.author}</span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton noteId={note.id} />
                        <VoteButtons
                          itemId={`note-${note.id}`}
                          authorId={note.authorId}
                          courseId={note.courseId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowseNotes
