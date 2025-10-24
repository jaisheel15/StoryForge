import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
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

  return (
    <div className="card max-w-md mx-auto p-6"> {/* Centered card */}
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Username:</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full mt-2">Login</button>
      </form>

      {message && <p className="text-center mt-4">{message}</p>}

      <p className="text-center mt-4 text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-blue-600 hover:underline">
          Register Here
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;