import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://storyforge-7oc4.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in.');
      }
      
      login(data);
      navigate('/'); // Redirect to homepage on success

    } catch (err) {
      setMessage(err.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg sm:p-10">
        <div className="flex flex-col">
          <h1 className="pb-6 text-center text-3xl font-bold text-white">Login</h1>
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium text-gray-300">Username</p>
              <input 
                className="h-14 w-full resize-none overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 p-[15px] text-base font-normal text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-0 focus:ring-2 focus:ring-blue-500/50" 
                placeholder="Enter your username" 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium text-gray-300">Password</p>
              <div className="relative flex w-full items-center">
                <input 
                  className="h-14 w-full resize-none overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 p-[15px] pr-12 text-base font-normal text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-0 focus:ring-2 focus:ring-blue-500/50" 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute right-0 mr-4 text-gray-400 hover:text-gray-300" 
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </label>
            <div className="pt-3">
              <button 
                type="submit"
                className="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-blue-600 text-base font-bold text-white transition hover:bg-blue-700"
              >
                <span className="truncate">Login</span>
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-red-400">{message}</p>
          )}

          <p className="pt-6 text-center text-sm font-normal text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-blue-500 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;