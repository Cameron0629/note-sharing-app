import { useCourse } from '../contexts/CourseContext'
import CourseSelectionPrompt from '../components/CourseSelectionPrompt'

function Reels() {
  const { selectedCourse } = useCourse()

  // Sample reels - in a real app, this would come from an API filtered by selectedCourse
  const reels = [
    {
      id: 1,
      title: 'Quick Algorithm Explanation',
      author: 'John Doe',
      thumbnail: '🎥',
      duration: '2:30',
      views: 1234,
      courseId: 1
    },
    {
      id: 2,
      title: 'Problem Solving Walkthrough',
      author: 'Jane Smith',
      thumbnail: '📹',
      duration: '5:15',
      views: 856,
      courseId: 1
    },
    {
      id: 3,
      title: 'Study Tips for CS101',
      author: 'Bob Johnson',
      thumbnail: '🎬',
      duration: '3:45',
      views: 2100,
      courseId: 1
    }
  ]

  if (!selectedCourse) {
    return <CourseSelectionPrompt message="Please select a course to view reels." />
  }

  // Filter reels by selected course
  const courseReels = reels.filter((reel) => reel.courseId === selectedCourse.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Reels</h1>
            <p className="text-gray-600">
              Course: <span className="font-semibold">{selectedCourse.code} - {selectedCourse.name}</span>
            </p>
          </div>

          {courseReels.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">No reels available for this course yet.</p>
              <p className="text-gray-400">Be the first to share a reel!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseReels.map((reel) => (
                <div
                  key={reel.id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-6xl">{reel.thumbnail}</div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {reel.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-20 rounded-full p-4">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{reel.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{reel.author}</span>
                      <span>{reel.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scroll indicator for feed behavior */}
          {courseReels.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">Scroll for more reels</p>
              <div className="mt-2 flex justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full mx-1"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full mx-1"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full mx-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reels

