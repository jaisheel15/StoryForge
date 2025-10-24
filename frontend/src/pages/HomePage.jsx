import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // To link to each story page

function HomePage() {
  // 1. Create state to store our stories
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useEffect runs once when the component loads
  useEffect(() => {
    // 3. Define the function to fetch data
    async function fetchStories() {
      try {
        // Our backend API is running on port 3001
        const response = await fetch('http://localhost:3001/api/stories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStories(data); // Put the stories into state
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    // 4. Call the function
    fetchStories();
  }, []); // The empty array [] means "only run this once"

  // 5. Render the component
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching stories: {error}</div>;
  }

  return (
   <div>
      <h1 className="text-3xl font-bold mb-4">All Stories</h1>
      <div className="story-list">
        {stories.length === 0 ? (
          <p>No stories yet.</p>
        ) : (
          <ul>
            {stories.map(story => (
              <li key={story.id} className="card-hover"> {/* <-- USE CARD CLASS */}
                <Link to={`/story/${story.id}`}>
                  <strong className="text-xl text-blue-700 hover:text-blue-800">
                    {story.title}
                  </strong>
                </Link>
                <p className="text-gray-600">by {story.author_username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HomePage;