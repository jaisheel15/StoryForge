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
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-xl bg-gray-800 p-8 shadow-lg md:p-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-white">
              Start a New Story
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium text-gray-200">Title</p>
              <input 
                type="text"
                className="h-14 w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-base font-normal leading-normal text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-0 focus:ring-2 focus:ring-blue-500/50" 
                placeholder="Enter your story's title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </label>
            
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium text-gray-200">Chapter 1 Content</p>
              <textarea 
                className="w-full flex-1 resize-y overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-base font-normal leading-normal text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-0 focus:ring-2 focus:ring-blue-500/50" 
                placeholder="Once upon a time..." 
                rows="10"
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required
              />
            </label>
            
            <div>
              <button 
                type="submit"
                className="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-5 text-base font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="truncate">
                  {isSubmitting ? 'Creating...' : 'Create Story'}
                </span>
              </button>
            </div>
            
            {message && (
              <p className={`text-center text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateStoryPage;