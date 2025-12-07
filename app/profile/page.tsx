'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Settings, Edit, Grid3x3, Video, Bookmark, Bot } from 'lucide-react';
import Image from 'next/image';
import ReactPlayer from 'react-player';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  badges: string[];
  postsCount: number;
  shortsCount: number;
}

interface Post {
  _id: string;
  videoUrl: string;
  thumbnail: string;
  caption: string;
  type: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'shorts' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      router.push('/welcome');
      return;
    }
    fetchProfile(userId);
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
      
      // Fetch user posts
      const postsResponse = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const postsData = await postsResponse.json();
      setPosts(postsData);

      // Fetch saved posts
      const savedResponse = await fetch('http://localhost:5000/api/saved', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const savedData = await savedResponse.json();
      setSavedPosts(savedData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleFollowers = () => {
    router.push('/profile/followers');
  };

  const handleFollowing = () => {
    router.push('/profile/following');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-accent text-xl">Loading...</div>
        <BottomNav />
      </div>
    );
  }

  const displayedPosts = activeTab === 'posts' 
    ? posts.filter(p => p.type === 'video')
    : activeTab === 'shorts'
    ? posts.filter(p => p.type === 'short')
    : savedPosts;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accent">{user.username}</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/ai-chat')} title="AI Chat">
            <Bot className="w-6 h-6 text-gray-400 hover:text-accent" />
          </button>
          <button onClick={handleEditProfile}>
            <Edit className="w-6 h-6 text-gray-400 hover:text-accent" />
          </button>
          <button>
            <Settings className="w-6 h-6 text-gray-400 hover:text-accent" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt={user.username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-accent text-2xl">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-bold text-white">{user.username}</span>
              {user.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`w-4 h-4 rounded-full ${
                    badge === 'white' ? 'bg-white' :
                    badge === 'red' ? 'bg-red-500' :
                    'bg-accent'
                  }`}
                  title={`${badge} badge`}
                />
              ))}
            </div>
            {user.bio && <p className="text-gray-400 text-sm">{user.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.postsCount}</div>
            <div className="text-sm text-gray-400">Posts</div>
          </div>
          <button onClick={handleFollowers} className="text-center">
            <div className="text-xl font-bold text-white">{user.followers.length}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </button>
          <button onClick={handleFollowing} className="text-center">
            <div className="text-xl font-bold text-white">{user.following.length}</div>
            <div className="text-sm text-gray-400">Following</div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/50 px-4 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-colors ${
            activeTab === 'posts' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
          }`}
        >
          <Grid3x3 className="w-5 h-5" />
          Posts
        </button>
        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-colors ${
            activeTab === 'shorts' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
          }`}
        >
          <Video className="w-5 h-5" />
          Shorts
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-colors ${
            activeTab === 'saved' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          Saved
        </button>
      </div>

      {/* Content Grid */}
      <div className="px-4">
        {displayedPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No {activeTab} yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayedPosts.map((post) => (
              <div key={post._id} className="aspect-square bg-primary/20 rounded overflow-hidden relative group">
                {post.thumbnail ? (
                  <Image
                    src={post.thumbnail}
                    alt={post.caption || 'Post'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/30">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Video className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

