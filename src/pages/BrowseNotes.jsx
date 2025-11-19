import { useState } from 'react'
import { useCourse } from '../contexts/CourseContext'
import CourseSelectionPrompt from '../components/CourseSelectionPrompt'

function BrowseNotes() {
  const { selectedCourse } = useCourse()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Sample notes - in a real app, this would come from an API filtered by selectedCourse
  const allNotes = [
    {
      id: 1,
      title: 'Lecture 1: Introduction to Algorithms',
      author: 'John Doe',
      content: 'Key concepts covered: time complexity, space complexity, Big O notation...',
      tags: ['lecture', 'algorithms'],
      date: '2024-01-15',
      courseId: 1
    },
    {
      id: 2,
      title: 'Midterm Study Guide',
      author: 'Jane Smith',
      content: 'Comprehensive study guide covering chapters 1-5...',
      tags: ['study-guide', 'exam'],
      date: '2024-01-14',
      courseId: 1
    },
    {
      id: 3,
      title: 'Problem Set Solutions',
      author: 'Bob Johnson',
      content: 'Solutions to problem set 3 with detailed explanations...',
      tags: ['homework', 'solutions'],
      date: '2024-01-13',
      courseId: 1
    }
  ]

  if (!selectedCourse) {
    return <CourseSelectionPrompt message="Please select a course to browse notes." />
  }

  // Filter notes by selected course and search query
  const filteredNotes = allNotes.filter((note) => {
    const matchesCourse = note.courseId === selectedCourse.id
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = filterTag === 'all' || note.tags.includes(filterTag)

    return matchesCourse && matchesSearch && matchesTag
  })

  // Get all unique tags for filter
  const allTags = ['all', ...new Set(allNotes.flatMap((note) => note.tags))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Notes</h1>
            <p className="text-gray-600">
              Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
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
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tag:</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <p className="text-gray-500 text-lg">No notes found matching your criteria.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
                    <span className="text-sm text-gray-500">{note.date}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{note.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">By {note.author}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowseNotes

