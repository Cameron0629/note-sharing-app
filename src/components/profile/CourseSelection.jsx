import { useState, useMemo } from 'react'
import { useCourse } from '../../contexts/CourseContext'
import { useCourses } from '../../contexts/CoursesContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSchools } from '../../contexts/SchoolsContext'
import FavoriteCourseButton from '../FavoriteCourseButton'

function CourseSelection() {
  const { selectedCourse, selectCourse } = useCourse()
  const { courses, loading: coursesLoading, addCourse } = useCourses()
  const { userData, loading: authLoading } = useAuth()
  const { schools, loading: schoolsLoading } = useSchools()
  const loading = coursesLoading || authLoading || schoolsLoading
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    professor: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterProfessor, setFilterProfessor] = useState('all')
  const [filterFavorited, setFilterFavorited] = useState(false)
  const [sortBy, setSortBy] = useState('code')

  const hasSchool = userData?.schoolId && userData.schoolId !== ''
  const userSchool = schools.find(s => s.id === userData?.schoolId)

  // Get unique departments and professors for filters
  const departments = useMemo(() => {
    const depts = courses
      .map(c => c.department)
      .filter(d => d && d.trim() !== '')
    return ['all', ...new Set(depts)].sort()
  }, [courses])

  const professors = useMemo(() => {
    const profs = courses
      .map(c => c.professor)
      .filter(p => p && p.trim() !== '')
    return ['all', ...new Set(profs)].sort()
  }, [courses])

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    const favoritedCourseIds = userData?.favoritedCourses || []
    
    let filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.professor?.toLowerCase().includes(searchQuery.toLowerCase())

      // Department filter
      const matchesDepartment = filterDepartment === 'all' || 
        course.department === filterDepartment

      // Professor filter
      const matchesProfessor = filterProfessor === 'all' || 
        course.professor === filterProfessor

      // Favorited filter
      const matchesFavorited = !filterFavorited || favoritedCourseIds.includes(course.id)

      return matchesSearch && matchesDepartment && matchesProfessor && matchesFavorited
    })

    // Sort courses
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'code':
          return (a.code || '').localeCompare(b.code || '')
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'department':
          return (a.department || '').localeCompare(b.department || '')
        case 'professor':
          return (a.professor || '').localeCompare(b.professor || '')
        default:
          return 0
      }
    })

    return sorted
  }, [courses, searchQuery, filterDepartment, filterProfessor, filterFavorited, userData?.favoritedCourses, sortBy])


  const handleAddCourse = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!hasSchool) {
      setError('Please select a school first in School Selection tab')
      return
    }
    
    if (!formData.code || !formData.name) {
      setError('Course code and name are required')
      return
    }

    setSubmitting(true)
    try {
      await addCourse(formData)
      setFormData({ code: '', name: '', department: '', professor: '' })
      setShowAddForm(false)
    } catch (err) {
      setError(err.message || 'Failed to add course')
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading if auth is still loading or userData is not yet available
  if (authLoading || !userData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (coursesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading courses...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Course Selection</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Select a course to browse notes and post content for that course.
          </p>
        </div>
        {hasSchool && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors text-sm whitespace-nowrap self-start sm:self-auto"
          >
            {showAddForm ? 'Cancel' : '+ Add Course'}
          </button>
        )}
      </div>

      {!hasSchool && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ School Required:</strong> Please select a school in the{' '}
            <strong>School Selection</strong> tab before adding courses.
          </p>
        </div>
      )}

      {hasSchool && userSchool && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>School:</strong> {userSchool.name}
          </p>
        </div>
      )}

      {showAddForm && hasSchool && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Course</h3>
          {userSchool && (
            <p className="text-sm text-gray-600 mb-4">
              Adding course for: <strong>{userSchool.name}</strong>
            </p>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professor
                </label>
                <input
                  type="text"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Course'}
            </button>
          </form>
        </div>
      )}

      {selectedCourse && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
          <p className="text-lg font-semibold text-blue-700">
            {selectedCourse.code} - {selectedCourse.name}
          </p>
        </div>
      )}

      {/* Search and Filter Controls */}
      {hasSchool && courses.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search courses by code, name, department, or professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Professor:</label>
              <select
                value={filterProfessor}
                onChange={(e) => setFilterProfessor(e.target.value)}
                className="w-full px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                {professors.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof === 'all' ? 'All Professors' : prof}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show Favorited Only:</label>
              <button
                onClick={() => setFilterFavorited(!filterFavorited)}
                className={`w-full px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-colors ${
                  filterFavorited
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filterFavorited ? '✓ Favorited Only' : 'Show All'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="code">Course Code A-Z</option>
                <option value="name">Course Name A-Z</option>
                <option value="department">Department A-Z</option>
                <option value="professor">Professor A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!hasSchool ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">Please select a school first.</p>
          <p className="text-gray-400 text-sm">Go to the School Selection tab to get started.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No courses available for your school yet.</p>
          <p className="text-gray-400">Be the first to add a course!</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No courses found matching your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterDepartment('all')
              setFilterProfessor('all')
              setFilterFavorited(false)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => selectCourse(course)}
                  className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg cursor-pointer ${
                selectedCourse?.id === course.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{course.code}</h3>
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <FavoriteCourseButton courseId={course.id} />
                  </div>
                  {selectedCourse?.id === course.id && (
                    <span className="text-blue-500 text-xl">✓</span>
                  )}
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-1">{course.name}</p>
              {course.department && (
                <p className="text-sm text-gray-500 mb-1">{course.department}</p>
              )}
              {course.professor && (
                <p className="text-sm text-gray-600 font-medium">👤 {course.professor}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseSelection

