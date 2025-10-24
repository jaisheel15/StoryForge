import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AlternativesPage() {
  // We get both IDs from the URL
  const { storyId, parentChapterId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAlternatives() {
      try {
        setLoading(true);
        const response = await fetch(`https://storyforge-7oc4.onrender.com/api/chapters/pending/${parentChapterId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAlternatives(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAlternatives();
  }, [parentChapterId]); // Re-run if the parentChapterId changes

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-700/50 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-4 text-white">
            <div className="size-6 text-blue-500">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">StoryForge</h2>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/create-story" className="hidden text-sm font-medium leading-normal text-white sm:block hover:text-blue-400 transition-colors">
                  Create Story
                </Link>
                <Link to="/" className="hidden text-sm font-medium leading-normal text-white sm:block hover:text-blue-400 transition-colors">
                  Explore
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors"
                >
                  Logout
                </button>
                <div className="bg-linear-to-br from-blue-500 to-purple-600 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex items-center justify-center text-white font-bold">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl grow px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            to={`/story/${storyId}`} 
            className="flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span>Back to the main story</span>
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black leading-tight tracking-tighter text-gray-50 sm:text-5xl">
            Paths Not Taken
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-300">
            <p className="text-lg">Loading alternative paths...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400">
            <p className="text-lg">Error loading paths: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {alternatives.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">
                <p className="text-lg">No alternative paths have been submitted yet.</p>
              </div>
            ) : (
              alternatives.map((alt) => (
                <div key={alt.id} className="group block cursor-pointer">
                  <div className="flex h-full flex-col rounded-xl bg-gray-800/50 p-6 shadow-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-lg">
                    <blockquote className="grow">
                      <p className="text-lg leading-relaxed text-gray-200">
                        {alt.content}
                      </p>
                    </blockquote>
                    <cite className="mt-4 block text-right text-sm not-italic text-gray-400">
                      — by {alt.author_username}
                    </cite>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AlternativesPage;