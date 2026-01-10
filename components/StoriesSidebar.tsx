'use client'
import { useEffect, useState } from 'react'

interface Story {
  id: string;
  title: string;
  createdAt: Date;
}

export default function StoriesSidebar({ }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error('Failed to fetch stories');
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 transform 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 z-40 overflow-y-auto`}>
      <div className="p-4 mt-16">
        <h2 className="text-xl font-bold mb-4">Your Stories</h2>
        {loading ? (
          <p>Loading stories...</p>
        ) : stories.length === 0 ? (
          <p>No stories found</p>
        ) : (
          <ul className="space-y-2">
            {stories.map((story) => (
              <li
                key={story.id}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <h3 className="font-medium">{story.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 