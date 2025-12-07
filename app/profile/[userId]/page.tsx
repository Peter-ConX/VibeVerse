'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { MessageCircle, UserPlus, Grid3x3, Video, Bookmark } from 'lucide-react';
import Image from 'next/image';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
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
  likes: string[];
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const currentUserId = localStorage.getItem('userId') || '';
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'shorts' | 'saved'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
      setIsFollowing(data.followers?.includes(currentUserId) || false);
      
      // Fetch user posts
      const postsResponse = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const postsData = await postsResponse.json();
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIsFollowing(data.isFollowing);
      
      setUser(prev => prev ? {
        ...prev,
        followers: data.isFollowing 
          ? [...prev.followers, currentUserId]
          : prev.followers.filter(id => id !== currentUserId)
      } : null);
      
      toast.success(data.isFollowing ? 'Followed!' : 'Unfollowed');
    } catch (error) {
      toast.error('Error following user');
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${userId}`);
  };

  const handleFollowers = () => {
    router.push(`/profile/${userId}/followers`);
  };

  const handleFollowing = () => {
    router.push(`/profile/${userId}/following`);
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
    : [];

  const isOwnProfile = userId === currentUserId;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-accent">{user.username}</h1>
        <div className="w-8" /> {/* Spacer */}
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

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isFollowing
                  ? 'bg-primary/50 text-gray-300 border border-primary/50'
                  : 'bg-accent text-primary'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={handleMessage}
              className="px-4 py-2 bg-primary/50 border border-primary/50 rounded-lg hover:bg-primary/70 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-accent" />
            </button>
          </div>
        )}
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
              <div 
                key={post._id} 
                className="aspect-square bg-primary/20 rounded overflow-hidden relative group cursor-pointer"
                onClick={() => router.push(`/post/${post._id}`)}
              >
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
