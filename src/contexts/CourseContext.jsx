import { createContext, useContext, useState } from 'react'

const CourseContext = createContext()

export function CourseProvider({ children }) {
  const [selectedCourse, setSelectedCourse] = useState(null)

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

