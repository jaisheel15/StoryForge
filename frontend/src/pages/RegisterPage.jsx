import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
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

  return (
    <div className="card max-w-md mx-auto p-6"> {/* Centered card */}
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit" className="btn-primary w-full mt-2">Register</button>
      </form>
      
      {message && <p className="text-center mt-4">{message}</p>}
      
      <p className="text-center mt-4 text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;