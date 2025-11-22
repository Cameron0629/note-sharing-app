import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../contexts/NotesContext'
import { useAuth } from '../contexts/AuthContext'
import { useCourses } from '../contexts/CoursesContext'
import VoteButtons from '../components/VoteButtons'
import FavoriteButton from '../components/FavoriteButton'

function NoteDetail() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { notes, updateNote, deleteNote } = useNotes()
  const { currentUser } = useAuth()
  const { courses } = useCourses()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    tags: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const note = notes.find(n => n.id === noteId)
  const isOwner = note && currentUser && note.authorId === currentUser.uid
  const course = note ? courses.find(c => c.id === note.courseId) : null

  useEffect(() => {
    if (note && isEditing) {
      setEditData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags ? (Array.isArray(note.tags) ? note.tags.join(', ') : note.tags) : ''
      })
    }
  }, [note, isEditing])

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updateNote(noteId, {
        title: editData.title,
        content: editData.content,
        tags: editData.tags
      })
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update note')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteNote(noteId)
      navigate('/browse-notes')
    } catch (err) {
      setError(err.message || 'Failed to delete note')
      setIsDeleting(false)
    }
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Note Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">The note you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/browse-notes')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
          >
            Back to Browse Notes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/browse-notes')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Browse Notes</span>
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  required
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., lecture, homework, study-guide"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setError('')
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Note Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">{note.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      {course && (
                        <span className="font-semibold text-green-600">{course.code} - {course.name}</span>
                      )}
                      <span>By {note.author}</span>
                      <span>{note.date || note.createdAt?.split('T')[0]}</span>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors text-sm disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Content */}
              <div className="mb-6">
                <div className="prose max-w-none">
                  <p className="text-base sm:text-lg text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>

              {/* File Attachment */}
              {note.fileName && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
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
                      <span className="text-sm font-semibold text-blue-900">📎 Attached file: </span>
                      <span className="text-sm font-medium text-blue-700 break-words">{note.fileName}</span>
                    </div>
                    {note.fileUrl && (
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm flex-shrink-0"
                      >
                        Open File
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <FavoriteButton noteId={note.id} />
                  <VoteButtons
                    itemId={`note-${note.id}`}
                    authorId={note.authorId}
                    courseId={note.courseId}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteDetail

