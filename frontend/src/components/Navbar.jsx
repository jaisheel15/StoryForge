import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-4 text-gray-200">
            <div className="w-7 h-7 text-blue-500">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">StoryForge</h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/create-story"
                  className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-700/50 text-gray-200 hover:bg-gray-600/50 transition-colors"
                  title="Create Story"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:block text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors"
                >
                  Logout
                </button>
                <div className="bg-linear-to-br from-blue-500 to-purple-600 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex items-center justify-center text-white font-bold">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-medium leading-normal text-white hover:text-blue-400 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;