'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Video, Image as ImageIcon, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'video' | 'short' | 'story'>('video');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('type', type);
      formData.append('caption', caption);

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Post created successfully!');
        router.push('/home');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      toast.error('Error uploading post');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('media', selectedFile);

      const response = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Story posted!');
        router.push('/home');
      } else {
        toast.error('Failed to post story');
      }
    } catch (error) {
      toast.error('Error posting story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-accent">Create</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-accent"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setType('video')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              type === 'video'
                ? 'bg-accent text-primary'
                : 'bg-primary/30 text-gray-300 border border-primary/50'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setType('short')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              type === 'short'
                ? 'bg-accent text-primary'
                : 'bg-primary/30 text-gray-300 border border-primary/50'
            }`}
          >
            Short
          </button>
          <button
            onClick={() => setType('story')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              type === 'story'
                ? 'bg-accent text-primary'
                : 'bg-primary/30 text-gray-300 border border-primary/50'
            }`}
          >
            Story
          </button>
        </div>

        {/* File Upload */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:border-accent transition-colors"
          >
            <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Tap to upload {type === 'story' ? 'media' : 'video'}</p>
            <p className="text-sm text-gray-500">Supports MP4, MOV, AVI</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative mb-4">
            {type === 'story' ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <video
                src={preview}
                controls
                className="w-full rounded-lg"
              />
            )}
            <button
              onClick={() => {
                setPreview('');
                setSelectedFile(null);
              }}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Caption (not for stories) */}
        {type !== 'story' && (
          <div className="mb-6">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-primary/30 border border-primary/50 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
              rows={4}
            />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={type === 'story' ? handleStoryUpload : handleUpload}
          disabled={!selectedFile || loading}
          className="w-full bg-accent text-primary font-bold py-4 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : type === 'story' ? 'Post Story' : 'Post'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
