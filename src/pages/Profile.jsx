function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              U
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
              <p className="text-gray-600">user@example.com</p>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Notes</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-500">No notes yet. Start sharing your ideas!</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Email Notifications</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Enable
                </button>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Privacy Settings</span>
                <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

