import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SubmitChapterForm({ storyId, parentChapterId, onSubmissionSuccess }) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage('Chapter content cannot be empty.');
      return;
    }
    
    if (!storyId || !parentChapterId) {
      setMessage('Error: Missing story or chapter information.');
      console.error('Missing required IDs:', { storyId, parentChapterId });
      return;
    }

    setIsSubmitting(true);
    setMessage('Submitting...');

    try {
      const payload = {
        story_id: parseInt(storyId),
        parent_chapter_id: parseInt(parentChapterId),
        content: content.trim(),
      };
      
      console.log('Submitting chapter with payload:', payload);
      
      const response = await fetch('https://storyforge-7oc4.onrender.com/api/chapters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit chapter.');
      }

      setMessage('Chapter submitted successfully!');
      setContent(''); // Clear the form
      onSubmissionSuccess(); // Tell the parent page to refresh submissions

    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Continue the story here..."
        rows="5"
        className="w-full rounded-lg border border-gray-600 bg-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base text-gray-200 p-3"
        required
      />
      <button 
        type="submit" 
        className="self-end px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Chapter'}
      </button>
      {message && (
        <p className={`text-sm text-center ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </form>
  );
}

export default SubmitChapterForm;