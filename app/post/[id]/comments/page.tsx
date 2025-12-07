'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Heart } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  text: string;
  likes: string[];
  createdAt: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comments/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setComments(data);
      
      const liked = new Set<string>();
      data.forEach((comment: Comment) => {
        if (comment.likes.includes(userId)) {
          liked.add(comment._id);
        }
      });
      setLikedComments(liked);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          text: newComment,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast.success('Comment posted!');
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      toast.error('Error posting comment');
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: data.isLiked ? [...comment.likes, userId] : comment.likes.filter(id => id !== userId) }
          : comment
      ));
      
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-primary/50 p-4 flex items-center gap-4 z-10">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Comments</h1>
      </div>

      {/* Comments List */}
      <div className="p-4 space-y-4 pb-24">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {comment.userId.profilePicture ? (
                <Image
                  src={comment.userId.profilePicture}
                  alt={comment.userId.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent flex-shrink-0">
                  {comment.userId.username[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="bg-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{comment.userId.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{comment.text}</p>
                </div>
                <button
                  onClick={() => handleLike(comment._id)}
                  className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-accent"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedComments.has(comment._id) ? 'fill-accent text-accent' : ''
                    }`}
                  />
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-primary/50 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="bg-accent text-primary p-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}


