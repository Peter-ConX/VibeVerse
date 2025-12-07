'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import StoriesBar from '@/components/StoriesBar';
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
  type: string;
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    if (!token || !id) {
      router.push('/welcome');
      return;
    }
    setUserId(id);
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPosts(data);
      
      // Track which posts are liked
      const liked = new Set<string>();
      data.forEach((post: Post) => {
        if (post.likes.includes(userId)) {
          liked.add(post._id);
        }
      });
      setLikedPosts(liked);

      // Check saved posts
      const saved = new Set<string>();
      for (const post of data) {
        try {
          const savedResponse = await fetch(`http://localhost:5000/api/saved/${post._id}/check`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const savedData = await savedResponse.json();
          if (savedData.saved) {
            saved.add(post._id);
          }
        } catch (error) {
          // Ignore errors
        }
      }
      setSavedPosts(saved);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Backend prevents duplicate likes, but we check frontend state too
    if (likedPosts.has(postId)) {
      // Will unlike
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, likes: data.isLiked ? [...post.likes, userId] : post.likes.filter(id => id !== userId) }
          : post
      ));
      
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/saved/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        if (data.saved) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/post/${postId}/comments`);
  };

  const handleShare = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Copy to clipboard
      navigator.clipboard.writeText(data.shareUrl);
      alert('Link copied to clipboard!');
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, shares: data.shares }
          : post
      ));
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Stories Bar */}
      {userId && <StoriesBar userId={userId} />}

      {/* Feed */}
      <div className="space-y-4 px-4">
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>No posts yet. Follow users to see their content!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post._id} className="bg-primary/20 rounded-lg overflow-hidden border border-primary/50">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleProfileClick(post.userId._id)}
                >
                  {post.userId.profilePicture ? (
                    <Image
                      src={post.userId.profilePicture}
                      alt={post.userId.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent">
                      {post.userId.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-white">{post.userId.username}</span>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>

              {/* Video */}
              <div className="relative w-full aspect-[9/16] bg-black">
                {post.videoUrl ? (
                  <ReactPlayer
                    url={post.videoUrl}
                    width="100%"
                    height="100%"
                    playing={playingIndex === index}
                    controls
                    onPlay={() => {
                      // Track view
                      fetch(`http://localhost:5000/api/posts/${post._id}/view`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                      });
                      setPlayingIndex(index);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        likedPosts.has(post._id) ? 'fill-accent text-accent' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm text-gray-300">{post.likes.length}</span>
                  </button>
                  <button
                    onClick={() => handleComment(post._id)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-300">{post.comments.length}</span>
                  </button>
                  <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Share2 className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-300">{post.shares}</span>
                  </button>
                  <button
                    onClick={() => handleSave(post._id)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-auto"
                  >
                    <Bookmark
                      className={`w-6 h-6 transition-colors ${
                        savedPosts.has(post._id) ? 'fill-accent text-accent' : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div className="text-sm text-gray-300">
                    <span className="font-semibold">{post.userId.username}</span> {post.caption}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

