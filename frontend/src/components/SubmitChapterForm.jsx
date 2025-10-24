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

    setIsSubmitting(true);
    setMessage('Submitting...');

    try {
      const response = await fetch('https://storyforge-7oc4.onrender.com/api/chapters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story_id: storyId,
          parent_chapter_id: parentChapterId,
          content: content,
        }),
      });

      const data = await response.json();

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
<form onSubmit={handleSubmit} className="mt-4">
      <div className="form-group">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write what happens next..."
        rows="8"
        className="form-textarea"
        required
      />
 </div>
<button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Chapter'}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}

export default SubmitChapterForm;