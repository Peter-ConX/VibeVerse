const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Get user's liked posts to understand preferences
    const likedPosts = await Post.find({ likes: req.userId })
      .populate('userId', 'username profilePicture');

    // Extract music preferences
    const musicPreferences = likedPosts
      .map(post => post.music?.title)
      .filter(Boolean);

    // Extract hashtag preferences
    const hashtagPreferences = likedPosts
      .flatMap(post => post.hashtags || [])
      .filter(Boolean);

    // Get creators user follows
    const followingIds = user.following;

    // Find recommended posts based on:
    // 1. Music preferences
    // 2. Hashtag preferences
    // 3. Creators user follows
    // 4. Popular posts
    const recommendations = await Post.find({
      $or: [
        { 'music.title': { $in: musicPreferences } },
        { hashtags: { $in: hashtagPreferences } },
        { userId: { $in: followingIds } },
      ],
      _id: { $nin: likedPosts.map(p => p._id) },
    })
      .populate('userId', 'username profilePicture')
      .sort({ 
        likes: -1,
        views: -1,
        createdAt: -1,
      })
      .limit(30);

    // If not enough recommendations, add popular posts
    if (recommendations.length < 20) {
      const popularPosts = await Post.find({
        _id: { $nin: [...likedPosts.map(p => p._id), ...recommendations.map(p => p._id)] },
      })
        .populate('userId', 'username profilePicture')
        .sort({ likes: -1, views: -1 })
        .limit(20 - recommendations.length);

      recommendations.push(...popularPosts);
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
