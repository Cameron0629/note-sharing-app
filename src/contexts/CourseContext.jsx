import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CourseContext = createContext()

export function CourseProvider({ children }) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { userData } = useAuth()

  // Clear selected course when school changes
  useEffect(() => {
    if (selectedCourse) {
      // If selected course doesn't belong to current school, clear it
      if (userData?.schoolId && selectedCourse.schoolId !== userData.schoolId) {
        setSelectedCourse(null)
      }
    }
  }, [userData?.schoolId, selectedCourse])

  const selectCourse = (course) => {
    setSelectedCourse(course)
  }

  const clearCourse = () => {
    setSelectedCourse(null)
  }

  return (
    <CourseContext.Provider
      value={{
        selectedCourse,
        selectCourse,
        clearCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider')
  }
  return context
}
