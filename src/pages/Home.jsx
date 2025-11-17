function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to NoteShare</h1>
          <p className="text-lg text-gray-600 mb-6">
            Share, discover, and explore notes with the community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Browse Notes</h2>
              <p className="text-gray-600">Explore notes shared by the community</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <h2 className="text-xl font-semibold text-indigo-800 mb-2">Share Your Ideas</h2>
              <p className="text-gray-600">Create and share your own notes</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Your Profile</h2>
              <p className="text-gray-600">Manage your account and notes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

