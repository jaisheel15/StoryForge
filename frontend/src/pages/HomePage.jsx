import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
        const response = await fetch('https://storyforge-7oc4.onrender.com/api/stories');
        
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

  // Array of placeholder images for story cards
  const placeholderImages = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop",
  ];

  // 5. Render the component
  if (loading) {
    return (
      <div className="flex h-full grow items-center justify-center">
        <p className="text-xl text-gray-300">Loading stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full grow items-center justify-center">
        <p className="text-xl text-red-400">Error fetching stories: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-col items-center">
      <div className="flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
        <main className="flex flex-col">
          {/* Page Heading */}
          <div className="py-10">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white sm:text-5xl">
              All Stories
            </h1>
          </div>

          {/* Card Grid */}
          {stories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xl text-gray-400">No stories yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, index) => (
                <Link
                  key={story.id}
                  to={`/story/${story.id}`}
                  className="group block overflow-hidden rounded-lg transition-transform duration-300 ease-in-out hover:-translate-y-1"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-shadow duration-300 ease-in-out group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                      style={{
                        backgroundImage: `url("${placeholderImages[index % placeholderImages.length]}")`,
                      }}
                    />
                    <div className="flex flex-col grow p-5">
                      <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">
                        {story.title}
                      </h3>
                      <p className="mt-1 text-base font-normal leading-normal text-gray-400">
                        by {story.author_username}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;