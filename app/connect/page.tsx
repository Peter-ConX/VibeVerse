'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { UserPlus, MessageCircle, Users, Search } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface SuggestedUser {
  _id: string;
  username: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  badges: string[];
}

export default function ConnectPage() {
  const router = useRouter();
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/welcome');
      return;
    }
    fetchSuggestedUsers();
  }, [router]);

  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/suggested/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSuggestedUsers(data);
      
      // Check which users are already being followed
      const userId = localStorage.getItem('userId');
      const followingSet = new Set<string>();
      data.forEach((user: SuggestedUser) => {
        if (user.followers.includes(userId || '')) {
          followingSet.add(user._id);
        }
      });
      setFollowing(followingSet);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setFollowing(prev => {
        const newSet = new Set(prev);
        if (data.isFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      setSuggestedUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, followers: data.isFollowing ? [...user.followers, localStorage.getItem('userId') || ''] : user.followers.filter(id => id !== localStorage.getItem('userId')) }
          : user
      ));

      toast.success(data.isFollowing ? 'Followed!' : 'Unfollowed');
    } catch (error) {
      toast.error('Error following user');
    }
  };

  const handleMessage = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  const handleCreateGroup = () => {
    toast.success('Group creation feature coming soon!');
  };

  const filteredUsers = suggestedUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-accent mb-6">Connect</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-primary/30 border border-primary/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Create Group Button */}
        <button
          onClick={handleCreateGroup}
          className="w-full bg-primary/50 border border-primary/50 rounded-lg p-4 flex items-center gap-3 mb-6 hover:bg-primary/70 transition-colors"
        >
          <Users className="w-6 h-6 text-accent" />
          <span className="text-white font-semibold">Create Group</span>
        </button>

        {/* Suggested Users */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Suggested for You</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users found</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-primary/20 border border-primary/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.username}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-accent">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{user.username}</span>
                        {user.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`w-3 h-3 rounded-full ${
                              badge === 'white' ? 'bg-white' :
                              badge === 'red' ? 'bg-red-500' :
                              'bg-accent'
                            }`}
                            title={`${badge} badge`}
                          />
                        ))}
                      </div>
                      {user.bio && (
                        <p className="text-sm text-gray-400 truncate">{user.bio}</p>
                      )}
                      <p className="text-xs text-gray-500">{user.followers.length} followers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMessage(user._id)}
                      className="p-2 bg-primary/50 rounded-lg hover:bg-primary/70 transition-colors"
                      title="Message"
                    >
                      <MessageCircle className="w-5 h-5 text-accent" />
                    </button>
                    <button
                      onClick={() => handleFollow(user._id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        following.has(user._id)
                          ? 'bg-primary/50 text-gray-300 border border-primary/50'
                          : 'bg-accent text-primary'
                      }`}
                    >
                      {following.has(user._id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}


