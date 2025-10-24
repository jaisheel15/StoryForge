import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function AlternativesPage() {
  // We get both IDs from the URL
  const { storyId, parentChapterId } = useParams();

  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAlternatives() {
      try {
        setLoading(true);
        const response = await fetch(`https://storyforge-7oc4.onrender.com/api/chapters/pending/${parentChapterId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAlternatives(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAlternatives();
  }, [parentChapterId]); // Re-run if the parentChapterId changes

  if (loading) {
    return <div>Loading alternative paths...</div>;
  }

  if (error) {
    return <div>Error loading paths: {error}</div>;
  }

  return (
<div>
      <Link to={`/story/${storyId}`} className="text-blue-600 hover:underline">
        &larr; Back to the main story
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-4">Paths Not Taken</h1>
      <div className="alternatives-list">
        {alternatives.length === 0 ? (
          <p>No alternatives found.</p>
        ) : (
          alternatives.map(alt => (
            <div key={alt.id} className="card-inset"> {/* <-- USE CARD INSET */}
              <p>{alt.content}</p>
              <small className="text-gray-600"><em>&mdash; {alt.author_username}</em></small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlternativesPage;