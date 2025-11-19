import { useState } from 'react'

function UserPosts() {
  const [activeView, setActiveView] = useState('my-posts') // 'my-posts' or 'favorited'

  // Sample posts - in a real app, this would come from an API
  const myPosts = [
    {
      id: 1,
      title: 'Lecture 1: Introduction to Algorithms',
      course: 'CS101',
      date: '2024-01-15',
      views: 234,
      favorites: 12
    },
    {
      id: 2,
      title: 'Midterm Study Guide',
      course: 'CS101',
      date: '2024-01-14',
      views: 456,
      favorites: 28
    }
  ]

  const favoritedPosts = [
    {
      id: 3,
      title: 'Problem Set Solutions',
      course: 'MATH201',
      author: 'Jane Smith',
      date: '2024-01-13'
    },
    {
      id: 4,
      title: 'Physics Lab Notes',
      course: 'PHYS150',
      author: 'Bob Johnson',
      date: '2024-01-12'
    }
  ]

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
            My Posts
          </button>
          <button
            onClick={() => setActiveView('favorited')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'favorited'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Favorited Posts
          </button>
        </div>
      </div>

      {activePosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {activeView === 'my-posts'
              ? "You haven't posted any notes yet."
              : "You haven't favorited any posts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activePosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">{post.course}</span>
                    <span>{post.date}</span>
                    {activeView === 'my-posts' && (
                      <>
                        <span>{post.views} views</span>
                        <span>❤️ {post.favorites} favorites</span>
                      </>
                    )}
                    {activeView === 'favorited' && (
                      <span>By {post.author}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeView === 'my-posts' && (
                    <>
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                        Delete
                      </button>
                    </>
                  )}
                  {activeView === 'favorited' && (
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserPosts

