'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Bookmark } from 'lucide-react';
import ReactPlayer from 'react-player';
import Image from 'next/image';

interface Post {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  videoUrl: string;
  thumbnail: string;
  caption: string;
  likes: string[];
  comments: string[];
  shares: number;
}

export default function ShortsPage() {
  const router = useRouter();
  const [shorts, setShorts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
  const [savedShorts, setSavedShorts] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    if (!token || !id) {
      router.push('/welcome');
      return;
    }
    setUserId(id);
    fetchShorts();
  }, [router]);

  const fetchShorts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts/shorts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setShorts(data);
      
      const liked = new Set<string>();
      data.forEach((short: Post) => {
        if (short.likes.includes(userId)) {
          liked.add(short._id);
        }
      });
      setLikedShorts(liked);

      // Check saved shorts
      const saved = new Set<string>();
      for (const short of data) {
        try {
          const savedResponse = await fetch(`http://localhost:5000/api/saved/${short._id}/check`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const savedData = await savedResponse.json();
          if (savedData.saved) {
            saved.add(short._id);
          }
        } catch (error) {
          // Ignore errors
        }
      }
      setSavedShorts(saved);
    } catch (error) {
      console.error('Error fetching shorts:', error);
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLike = async (shortId: string) => {
    // Backend prevents duplicate likes
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${shortId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setShorts(prev => prev.map(short => 
        short._id === shortId 
          ? { ...short, likes: data.isLiked ? [...short.likes, userId] : short.likes.filter(id => id !== userId) }
          : short
      ));
      
      setLikedShorts(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(shortId);
        } else {
          newSet.delete(shortId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking short:', error);
    }
  };

  const handleSave = async (shortId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/saved/${shortId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setSavedShorts(prev => {
        const newSet = new Set(prev);
        if (data.saved) {
          newSet.add(shortId);
        } else {
          newSet.delete(shortId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error saving short:', error);
    }
  };

  const handleComment = (shortId: string) => {
    router.push(`/post/${shortId}/comments`);
  };

  const handleShare = async (shortId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${shortId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      navigator.clipboard.writeText(data.shareUrl);
      alert('Link copied to clipboard!');
      
      setShorts(prev => prev.map(short => 
        short._id === shortId 
          ? { ...short, shares: data.shares }
          : short
      ));
    } catch (error) {
      console.error('Error sharing short:', error);
    }
  };

  if (shorts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-gray-400">No shorts available</div>
        <BottomNav />
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div 
      ref={containerRef}
      onWheel={handleScroll}
      className="h-screen overflow-hidden bg-background pb-20"
    >
      <div className="h-full flex items-center justify-center relative">
        {/* Video */}
        <div className="w-full h-full max-w-md mx-auto relative">
          {currentShort && (
            <>
              <div className="absolute inset-0">
                {currentShort.videoUrl ? (
                  <ReactPlayer
                    url={currentShort.videoUrl}
                    width="100%"
                    height="100%"
                    playing={playing}
                    loop
                    controls={false}
                    onPlay={() => {
                      fetch(`http://localhost:5000/api/posts/${currentShort._id}/view`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                      });
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  {currentShort.userId.profilePicture ? (
                    <Image
                      src={currentShort.userId.profilePicture}
                      alt={currentShort.userId.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent">
                      {currentShort.userId.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-white">{currentShort.userId.username}</span>
                </div>
                {currentShort.caption && (
                  <p className="text-sm text-gray-300 mb-3">{currentShort.caption}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-4">
                <button
                  onClick={() => handleLike(currentShort._id)}
                  className="flex flex-col items-center hover:opacity-80 transition-opacity"
                >
                  <Heart
                    className={`w-8 h-8 transition-colors ${
                      likedShorts.has(currentShort._id) ? 'fill-accent text-accent' : 'text-white'
                    }`}
                  />
                  <span className="text-xs text-white mt-1">{currentShort.likes.length}</span>
                </button>
                <button
                  onClick={() => handleComment(currentShort._id)}
                  className="flex flex-col items-center hover:opacity-80 transition-opacity"
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                  <span className="text-xs text-white mt-1">{currentShort.comments.length}</span>
                </button>
                <button
                  onClick={() => handleShare(currentShort._id)}
                  className="flex flex-col items-center"
                >
                  <Share2 className="w-8 h-8 text-white" />
                  <span className="text-xs text-white mt-1">{currentShort.shares}</span>
                </button>
                <MoreVertical className="w-8 h-8 text-white" />
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}


