import { useNavigate } from 'react-router-dom'

function CourseSelectionPrompt({ message = 'Please select a course first.' }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-md w-full text-center">
        <div className="text-4xl sm:text-6xl mb-4">📚</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Course Selection Required</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => navigate('/profile#courses')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm sm:text-base"
        >
          Go to Course Selection
        </button>
      </div>
    </div>
  )
}

export default CourseSelectionPrompt

