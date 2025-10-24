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
  const [votedChapterId, setVotedChapterId] = useState(null);

  
  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://storyforge-7oc4.onrender.com/api/stories/${storyId}/canon`);
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
      const response = await fetch(`https://storyforge-7oc4.onrender.com/api/stories/${storyId}/advance`, {
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
      const response = await fetch(`https://storyforge-7oc4.onrender.com/api/chapters/pending/${lastCanonChapterId}`);
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
        const response = await fetch(`https://storyforge-7oc4.onrender.com/api/chapters/pending/${lastCanonChapterId}`);
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

    setVoteMessage(''); // Clear previous messages

    try {
      const response = await fetch(`https://storyforge-7oc4.onrender.com/api/chapters/${chapterId}/vote`, {
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

      setVotedChapterId(chapterId);
      setVoteMessage(`Vote cast successfully!`);
      // Refresh submissions to update vote counts
      fetchSubmissions();
      
    } catch (err) {
      setVoteMessage(`Error: ${err.message}`);
    }
  };
  const lastCanonChapter = storyData.chapters[storyData.chapters.length - 1];
  
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-8">
          {/* Back link */}
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to all stories</span>
            </Link>
          </div>

          {/* Story title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tighter text-white">
              {storyData.title}
            </h1>
            <p className="text-lg text-gray-400">by {storyData.author_username}</p>
          </div>

          <hr className="border-t border-gray-700/50"/>

          {/* Story chapters */}
          <div className="flex flex-col gap-10">
            {storyData.chapters.map((chapter, index) => (
              <React.Fragment key={chapter.chapter_id}>
                <article className="flex flex-col gap-3">
                  <p className="text-base font-normal leading-relaxed text-gray-300">
                    {chapter.content}
                  </p>
                  <p className="text-sm font-normal text-gray-500">by {chapter.author}</p>
                  {chapter.alternative_count > 0 && (
                    <Link 
                      to={`/story/${storyId}/alternatives/${chapter.chapter_id}`} 
                      className="text-sm font-medium text-blue-500 hover:underline"
                    >
                      See {chapter.alternative_count} other paths...
                    </Link>
                  )}
                </article>
                {index < storyData.chapters.length - 1 && (
                  <hr className="border-t border-gray-700/50"/>
                )}
              </React.Fragment>
            ))}
          </div>

          <hr className="border-t-2 border-dashed border-gray-700 my-4"/>

          {/* What happens next section */}
          <div className="bg-gray-800/40 rounded-xl p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">What happens next?</h2>

            {/* Author Controls */}
            {user && storyData && user.userId === storyData.author_id && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="grow">
                  <h3 className="font-bold text-yellow-300">Author Controls</h3>
                  <p className="text-sm text-yellow-400">As the original author, you can finalize the next chapter.</p>
                </div>
                <button 
                  onClick={handleAdvance}
                  className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
                >
                  End Voting &amp; Advance Story
                </button>
              </div>
            )}
            {advanceMessage && (
              <p className="text-sm text-center text-green-400">{advanceMessage}</p>
            )}

            {/* Submissions */}
            <div className="flex flex-col gap-4">
              {loadingSubmissions ? (
                <p className="text-gray-300 text-center">Loading submissions...</p>
              ) : submissions.length === 0 ? (
                <p className="text-gray-300 text-center">No submissions yet. Be the first!</p>
              ) : (
                submissions.map((sub) => {
                  const hasVoted = votedChapterId === sub.id;
                  return (
                    <div 
                      key={sub.id} 
                      className={`bg-gray-800 border ${hasVoted ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-700/50'} rounded-xl p-6 shadow-sm flex flex-col gap-4`}
                    >
                      <p className="text-gray-300">{sub.content}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-sm text-gray-400">by {sub.author_username}</p>
                        <button 
                          onClick={() => handleVote(sub.id)}
                          disabled={!token || hasVoted}
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                            hasVoted 
                              ? 'bg-green-600 text-white opacity-60 cursor-not-allowed' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {hasVoted ? (
                            <>
                              <span className="material-symbols-outlined text-base">check_circle</span>
                              Voted
                            </>
                          ) : (
                            'Vote for this chapter'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {voteMessage && (
              <p className="text-sm text-center text-blue-400">{voteMessage}</p>
            )}
          </div>

          {/* Submit your own chapter */}
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Submit your own chapter!</h2>
            {user ? (
              lastCanonChapter ? (
                <SubmitChapterForm 
                  storyId={storyId} 
                  parentChapterId={lastCanonChapter.chapter_id} 
                  onSubmissionSuccess={fetchSubmissions} 
                />
              ) : (
                <p className="text-gray-300">This story has no chapters yet.</p>
              )
            ) : (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="grow border-t border-gray-700"></div>
                  <span className="shrink mx-4 text-xs text-gray-500 uppercase">Or</span>
                  <div className="grow border-t border-gray-700"></div>
                </div>
                <div className="text-center">
                  <Link to="/login" className="font-medium text-gray-300 hover:underline">
                    Log in to submit your chapter.
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StoryPage;