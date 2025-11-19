import { useState } from 'react'

function SchoolSelection() {
  const [selectedSchool, setSelectedSchool] = useState(null)

  // Sample schools - in a real app, this would come from an API
  const schools = [
    { id: 1, name: 'State University', location: 'City, State' },
    { id: 2, name: 'Tech Institute', location: 'City, State' },
    { id: 3, name: 'Community College', location: 'City, State' },
    { id: 4, name: 'Private University', location: 'City, State' }
  ]

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school)
    // In a real app, save to backend
    console.log('Selected school:', school)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">School Selection</h2>
      <p className="text-gray-600 mb-6">
        Select your school to connect with other students and access school-specific content.
      </p>

      {selectedSchool && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
          <p className="text-lg font-semibold text-purple-700">
            {selectedSchool.name} - {selectedSchool.location}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools.map((school) => (
          <button
            key={school.id}
            onClick={() => handleSchoolSelect(school)}
            className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
              selectedSchool?.id === school.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{school.name}</h3>
                <p className="text-gray-600">{school.location}</p>
              </div>
              {selectedSchool?.id === school.id && (
                <span className="text-purple-500 text-2xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SchoolSelection

