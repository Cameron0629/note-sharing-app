import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useCourses } from './CoursesContext'

const CourseContext = createContext()

export function CourseProvider({ children }) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { userData } = useAuth()
  const { courses } = useCourses()

  // Clear selected course when school changes or course is no longer valid
  useEffect(() => {
    if (selectedCourse && userData?.schoolId) {
      const courseExists = courses.some(c => c.id === selectedCourse.id && c.schoolId === userData.schoolId)
      if (!courseExists) {
        setSelectedCourse(null)
      }
    } else if (!userData?.schoolId) {
      setSelectedCourse(null)
    }
  }, [userData?.schoolId, courses, selectedCourse])

  const selectCourse = useCallback((course) => {
    setSelectedCourse(course)
  }, [])

  const clearCourse = useCallback(() => {
    setSelectedCourse(null)
  }, [])

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
