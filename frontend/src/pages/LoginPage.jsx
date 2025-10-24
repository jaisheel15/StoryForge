import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  // We'll use separate state for each form to keep it simple
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [logUsername, setLogUsername] = useState('');
  const [logPassword, setLogPassword] = useState('');

  const [message, setMessage] = useState(''); // To show success/error messages
  const { login } = useAuth(); // Get the login function from context
  const navigate = useNavigate(); // For redirecting after login
  // --- Register Handler ---
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    setMessage('');

    try {
      const response = await fetch('https://storyforge-7oc4.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      // We won't auto-login them yet, just tell them it worked.
      setMessage(`Registration successful! You can now log in as '${data.user.username}'.`);
      setRegUsername('');
      setRegPassword('');

    } catch (err) {
      setMessage(err.message);
    }
  };

  // --- Login Handler ---
const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // ... (your existing fetch logic is fine) ...
      const response = await fetch('https://storyforge-7oc4.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: logUsername,
          password: logPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in.');
      }
      
      // 5. INSTEAD of console.log, call the login function
      login(data);
      
      // 6. Redirect the user to the homepage
      navigate('/'); 

    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="card p-6"> {/* <-- USE CARD CLASS */}
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input type="text" className="form-input" value={regUsername} onChange={(e) => setRegUsername(e.target.value)}  
              required
              
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input type="password" className="form-input" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full">Register</button>
        </form>
      </div>

      <div className="card p-6"> {/* <-- USE CARD CLASS */}
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input type="text" className="form-input" value={logUsername} onChange={(e) => setLogUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input type="password" className="form-input" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full">Login</button>
        </form>
      </div>

      {message && <p className="text-center col-span-1 md:col-span-2">{message}</p>}
    </div>
  );
}

export default LoginPage;