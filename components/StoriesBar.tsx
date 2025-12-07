'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface Story {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  mediaUrl: string;
  views: string[];
}

export default function StoriesBar({ userId }: { userId: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
      {/* Create Story */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/50 border-2 border-accent flex items-center justify-center cursor-pointer hover:bg-primary/70 transition-colors">
          <Plus className="w-6 h-6 text-accent" />
        </div>
        <span className="text-xs text-gray-400 mt-2">Your Story</span>
      </div>

      {/* Stories */}
      {stories.map((story) => (
        <div key={story._id} className="flex-shrink-0 flex flex-col items-center cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-primary p-0.5">
            <div className="w-full h-full rounded-full bg-background p-0.5">
              <div className="w-full h-full rounded-full bg-primary overflow-hidden">
                {story.userId.profilePicture ? (
                  <Image
                    src={story.userId.profilePicture}
                    alt={story.userId.username}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-accent">
                    {story.userId.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-2 truncate max-w-[64px]">
            {story.userId.username}
          </span>
        </div>
      ))}
    </div>
  );
}

