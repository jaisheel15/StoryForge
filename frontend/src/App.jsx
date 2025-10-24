import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import your new pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StoryPage from './pages/StoryPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CreateStoryPage from './pages/CreateStoryPage';
import AlternativesPage from './pages/AlternativesPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="app-container p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/story/:storyId" element={<StoryPage />} />
          <Route path="/story/:storyId/alternatives/:parentChapterId"  element={<AlternativesPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/create-story" element={<CreateStoryPage />} />
          </Route>
        </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;