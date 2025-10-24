import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://storyforge-7oc4.onrender.com/auth/register', {
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
        throw new Error(data.error || 'Failed to register.');
      }

      // On success, send them to the login page
      setMessage(`Registration successful! Please log in.`);
      navigate('/login');

    } catch (err) {
      setMessage(err.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">StoryForge</h2>
        </div>
        <div className="w-full rounded-xl bg-gray-800 p-8 shadow-lg">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">Create an Account</p>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleRegister}>
              <label className="flex flex-col">
                <p className="text-gray-300 text-base font-medium leading-normal pb-2">Username</p>
                <input 
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 bg-gray-900/50 h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal" 
                  placeholder="e.g., jane_doe" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col">
                <p className="text-gray-300 text-base font-medium leading-normal pb-2">Password</p>
                <div className="relative flex w-full flex-1 items-center">
                  <input 
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 bg-gray-900/50 h-12 placeholder:text-gray-500 pl-4 pr-10 text-base font-normal leading-normal" 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </div>
                </div>
              </label>
              <button 
                type="submit"
                className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              >
                <span className="truncate">Register</span>
              </button>
            </form>

            {message && (
              <p className="text-center text-sm text-green-400">{message}</p>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-500 hover:underline"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;