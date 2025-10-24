import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CreateStoryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Creating story...');

    try {
      const response = await fetch('https://storyforge-7oc4.onrender.com/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story.');
      }

      // Success! Redirect to the new story's page.
      setMessage('Story created successfully! Redirecting...');
      navigate(`/story/${data.story.id}`);

    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6"> {/* <-- USE CARD CLASS */}
      <h1 className="text-2xl font-bold mb-4">Start a New Story</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Chapter 1 Content:</label>
          <textarea rows="10" className="form-textarea" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Story'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default CreateStoryPage;