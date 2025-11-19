import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CourseProvider } from './contexts/CourseContext'
import { VotingProvider } from './contexts/VotingContext'
import { NotesProvider } from './contexts/NotesContext'
import Navigation from './components/Navigation'
import CourseSelection from './pages/CourseSelection'
import BrowseNotes from './pages/BrowseNotes'
import PostNotes from './pages/PostNotes'
import Reels from './pages/Reels'
import Profile from './pages/Profile'

function App() {
  return (
    <VotingProvider>
      <NotesProvider>
        <CourseProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <Routes>
                <Route path="/" element={<Navigate to="/course-selection" replace />} />
                <Route path="/course-selection" element={<CourseSelection />} />
                <Route path="/browse-notes" element={<BrowseNotes />} />
                <Route path="/post-notes" element={<PostNotes />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </BrowserRouter>
        </CourseProvider>
      </NotesProvider>
    </VotingProvider>
  )
}

export default App
 