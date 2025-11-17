function Notes() {
  // Sample notes data - in a real app, this would come from an API
  const sampleNotes = [
    {
      id: 1,
      title: "React Best Practices",
      author: "John Doe",
      content: "Here are some best practices for React development...",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "JavaScript Tips",
      author: "Jane Smith",
      content: "Some useful JavaScript tips and tricks...",
      date: "2024-01-14"
    },
    {
      id: 3,
      title: "CSS Grid Layout",
      author: "Bob Johnson",
      content: "A comprehensive guide to CSS Grid...",
      date: "2024-01-13"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Browse Notes</h1>
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold">
              + New Note
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{note.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{note.author}</span>
                  <span>{note.date}</span>
                </div>
              </div>
            ))}
          </div>

          {sampleNotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No notes found. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notes

