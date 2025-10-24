import React, { useState, useEffect , useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubmitChapterForm from '../components/SubmitChapterForm';

function StoryPage() {
  const { storyId } = useParams();
  const { token , user } = useAuth();

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW STATE ---
  // To hold the list of pending submissions
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [voteMessage, setVoteMessage] = useState('');
  const [advanceMessage, setAdvanceMessage] = useState('');

  
  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/stories/${storyId}/canon`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStoryData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [storyId]);
  // --- 2. UPDATE first useEffect ---
  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

const handleAdvance = async () => {
    if (!window.confirm('Are you sure you want to end voting and advance the story?')) {
      return;
    }

    setAdvanceMessage('Advancing story...');
    try {
      const response = await fetch(`http://localhost:3001/api/stories/${storyId}/advance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to advance story.');

      setAdvanceMessage(`Success! Chapter ${data.newCanonChapter.id} is now canon.`);

      // REFRESH all data on the page
      fetchStory();
      fetchSubmissions();

    } catch (err) {
      setAdvanceMessage(`Error: ${err.message}`);
    }
  };


  const fetchSubmissions = useCallback(async () => {
    if (!storyData) return;

    const lastCanonChapter = storyData.chapters[storyData.chapters.length - 1];
    if (!lastCanonChapter) {
      setLoadingSubmissions(false);
      return;
    }
    const lastCanonChapterId = lastCanonChapter.chapter_id;

    try {
      setLoadingSubmissions(true);
      const response = await fetch(`http://localhost:3001/api/chapters/pending/${lastCanonChapterId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSubmissions(data);
    } catch (e) {
      console.error("Failed to fetch submissions:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [storyData]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // --- 2. NEW EFFECT ---
  // This effect runs *after* the story data is loaded
  useEffect(() => {
    // Make sure we have story data before trying to fetch submissions
    if (!storyData) {
      return;
    }

    // Find the ID of the very last canon chapter
    const lastCanonChapter = storyData?.chapters[storyData.chapters.length - 1];
    if (!lastCanonChapter) {
      setLoadingSubmissions(false);
      return; // No chapters, so no submissions
    }
    
    const lastCanonChapterId = lastCanonChapter.chapter_id;

    // Now, fetch the pending submissions for that chapter
    async function fetchSubmissions() {
      try {
        setLoadingSubmissions(true);
        const response = await fetch(`http://localhost:3001/api/chapters/pending/${lastCanonChapterId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubmissions(data);
      } catch (e) {
        // Don't set the main page error, just log it
        console.error("Failed to fetch submissions:", e);
      } finally {
        setLoadingSubmissions(false);
      }
    }

    fetchSubmissions();
  }, [storyData]); // This effect depends on 'storyData'

  // --- RENDER LOGIC (small updates) ---
  if (loading) {
    return <div>Loading story...</div>;
  }

  if (error) {
    return <div>Error loading story: {error}</div>;
  }

  if (!storyData) {
    return <div>Story not found.</div>;
  }

const handleVote = async (chapterId) => {
    if (!token) {
      setVoteMessage('You must be logged in to vote.');
      return;
    }

    setVoteMessage('Casting vote...'); // Show loading feedback

    try {
      const response = await fetch(`http://localhost:3001/api/chapters/${chapterId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // <-- Send the token
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cast vote.');
      }

      setVoteMessage(`Vote cast successfully for chapter ${chapterId}!`);
      // You could also disable the button here or re-fetch the votes
      
    } catch (err) {
      setVoteMessage(`Error: ${err.message}`);
    }
  };
  const lastCanonChapter = storyData.chapters[storyData.chapters.length - 1];
  return (
<div>
      <Link to="/" className="text-blue-600 hover:underline">
        &larr; Back to all stories
      </Link>

      <h1 className="text-4xl font-bold mt-2">{storyData.title}</h1>
      <p className="mb-6 text-gray-600"><em>by {storyData.author_username}</em></p>

      <div className="prose-content">
        {storyData.chapters.map(chapter => (
          <div key={chapter.chapter_id} className="chapter mb-4">
            <p>{chapter.content}</p>
            <small><em>&mdash; {chapter.author}</em></small>
            {chapter.alternative_count > 0 && (
              <div className="pl-4 mt-1">
                <Link to={`/story/${storyId}/alternatives/${chapter.chapter_id}`} className="text-sm text-blue-600 hover:underline">
                  See {chapter.alternative_count} other paths...
                </Link>
              </div>
            )}
            <hr className="my-6" />
          </div>
        ))}
      </div>

      <div className="submissions-section card-inset"> {/* <-- USE CARD INSET */}
        <h3 className="text-xl font-bold mb-4">What happens next?</h3>

        {user && storyData && user.userId === storyData.author_id && (
          <div className="author-controls mb-4"> {/* <-- USE AUTHOR CONTROLS */}
            <strong>Author Controls:</strong>
            <button onClick={handleAdvance} className="btn-warning ml-2">
              End Voting & Advance Story
            </button>
            {advanceMessage && <p className="mt-2 text-sm">{advanceMessage}</p>}
          </div>
        )}

        {loadingSubmissions ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p>No submissions yet. Be the first!</p>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="submission card bg-white"> {/* <-- USE CARD */}
              <p>{sub.content}</p>
              <small><em>by {sub.author_username}</em></small>
              <br />
              <button onClick={() => handleVote(sub.id)} className="btn-success mt-2">
                Vote for this chapter
              </button>
            </div>
          ))
        )}
        {voteMessage && <p className="mt-2 text-sm">{voteMessage}</p>}
      </div>

      <div className="add-chapter-section card p-6"> {/* <-- USE CARD */}
        <h3 className="text-xl font-bold mb-2">Submit your own chapter!</h3>
        {user ? (
          lastCanonChapter ? (
            <SubmitChapterForm storyId={storyId} parentChapterId={lastCanonChapter.id} onSubmissionSuccess={fetchSubmissions} />
          ) : ( <p>This story has no chapters yet.</p> )
        ) : (
          <p><Link to="/login" className="font-bold text-blue-600 hover:underline">Log in</Link> to submit your own chapter.</p>
        )}
      </div>
    </div>
  );
}

export default StoryPage;