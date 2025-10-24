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
<nav className="bg-white shadow-md">
    <div className="app-container flex justify-between items-center p-4">
      <Link to="/">
        <h1 className="text-2xl font-bold text-gray-900">StoryForge</h1>
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/create-story" className="text-gray-600 hover:text-blue-600">
              Create Story
            </Link>
            <span className="text-gray-700">Welcome, {user.username}!</span>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  </nav>
  );
}

export default Navbar;