import { useState, useMemo } from 'react'
import { useCourse } from '../../contexts/CourseContext'
import { useNotes } from '../../contexts/NotesContext'
import { useAuth } from '../../contexts/AuthContext'
import CourseSelectionPrompt from '../CourseSelectionPrompt'
import VoteButtons from '../VoteButtons'
import FavoriteButton from '../FavoriteButton'

function FavoritedNotes() {
  const { selectedCourse } = useCourse()
  const { notes, loading } = useNotes()
  const { userData } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  if (!userData?.schoolId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-4xl sm:text-6xl mb-4">🏫</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">School Selection Required</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">Please select a school to view favorited notes.</p>
      </div>
    )
  }

  if (!selectedCourse) {
    return <CourseSelectionPrompt message="Please select a course to view favorited notes." />
  }

  const favoritedNotes = useMemo(() => {
    const favoritedNoteIds = userData?.favoritedPosts || []
    if (!selectedCourse || !userData?.schoolId) return []
    
    return notes.filter(note => 
      favoritedNoteIds.includes(note.id) &&
      note.courseId === selectedCourse.id &&
      note.schoolId === userData.schoolId
    )
  }, [notes, userData?.favoritedPosts, selectedCourse?.id, userData?.schoolId])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = favoritedNotes.filter((note) => {
      const matchesSearch =
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = filterTag === 'all' || (note.tags && note.tags.includes(filterTag))

      return matchesSearch && matchesTag
    })

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        case 'oldest':
          return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'author':
          return (a.author || '').localeCompare(b.author || '')
        default:
          return 0
      }
    })

    return sorted
  }, [favoritedNotes, searchQuery, filterTag, sortBy])

  const allTags = useMemo(() => {
    const tags = favoritedNotes.flatMap((note) => note.tags || [])
    return ['all', ...new Set(tags)]
  }, [favoritedNotes])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading favorited notes...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Favorited Notes</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search favorited notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
        />
      </div>

      {/* Filtering Controls */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tag:</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            <p className="text-base sm:text-lg text-gray-500">
              {favoritedNoteIds.length === 0
                ? "You haven't favorited any notes yet."
                : "No favorited notes found matching your criteria for this course."}
            </p>
            {favoritedNoteIds.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">Try selecting a different course or adjusting your filters.</p>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex-1">{note.title}</h2>
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{note.date || note.createdAt?.split('T')[0]}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{note.content}</p>
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
                      <span className="text-xs sm:text-sm font-medium text-blue-700 break-words">{note.fileName}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {note.tags && note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <span className="text-xs sm:text-sm text-gray-500">By {note.author}</span>
                  <div className="flex items-center gap-2">
                    <FavoriteButton noteId={note.id} />
                    <VoteButtons
                      itemId={`note-${note.id}`}
                      authorId={note.authorId}
                      courseId={selectedCourse.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FavoritedNotes

