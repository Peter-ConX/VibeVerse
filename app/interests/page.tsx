'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Film, Trophy, Sparkles } from 'lucide-react';

const musicGenres = ['Hip Hop', 'Pop', 'Rock', 'R&B', 'Electronic', 'Jazz', 'Country', 'Classical', 'Reggae', 'Latin'];
const movieGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Fantasy'];
const sports = ['Football', 'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Golf', 'Swimming', 'Running', 'Cycling', 'Boxing'];
const contentTypes = ['Vlogs', 'Tutorials', 'Comedy', 'Music', 'Dance', 'Cooking', 'Gaming', 'Fashion', 'Travel', 'Fitness'];

export default function InterestsPage() {
  const router = useRouter();
  const [interests, setInterests] = useState({
    music: [] as string[],
    movies: [] as string[],
    sports: [] as string[],
    contentTypes: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggleInterest = (category: keyof typeof interests, item: string) => {
    setInterests(prev => {
      const current = prev[category];
      const index = current.indexOf(item);
      if (index > -1) {
        return { ...prev, [category]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...current, item] };
      }
    });
  };

  const handleContinue = async () => {
    if (interests.music.length === 0 && interests.movies.length === 0 && 
        interests.sports.length === 0 && interests.contentTypes.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(interests),
      });

      if (response.ok) {
        router.push('/home');
      } else {
        alert('Failed to save interests');
      }
    } catch (error) {
      alert('Error saving interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-accent mb-2">Choose Your Interests</h1>
          <p className="text-gray-400">Help us personalize your feed</p>
        </motion.div>

        {/* Music Genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Music Genres</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {musicGenres.map(genre => (
              <button
                key={genre}
                onClick={() => toggleInterest('music', genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.music.includes(genre)
                    ? 'bg-accent text-primary'
                    : 'bg-primary/30 text-gray-300 border border-primary/50 hover:border-accent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Movie Genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Movie Genres</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {movieGenres.map(genre => (
              <button
                key={genre}
                onClick={() => toggleInterest('movies', genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.movies.includes(genre)
                    ? 'bg-accent text-primary'
                    : 'bg-primary/30 text-gray-300 border border-primary/50 hover:border-accent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Sports</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => (
              <button
                key={sport}
                onClick={() => toggleInterest('sports', sport)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.sports.includes(sport)
                    ? 'bg-accent text-primary'
                    : 'bg-primary/30 text-gray-300 border border-primary/50 hover:border-accent'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Content Types</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleInterest('contentTypes', type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.contentTypes.includes(type)
                    ? 'bg-accent text-primary'
                    : 'bg-primary/30 text-gray-300 border border-primary/50 hover:border-accent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-accent text-primary font-bold py-4 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
