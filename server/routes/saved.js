const express = require('express');
const SavedPost = require('../models/SavedPost');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Get saved posts
router.get('/', auth, async (req, res) => {
  try {
    const savedPosts = await SavedPost.find({ userId: req.userId })
      .populate({
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'username profilePicture',
        },
      })
      .sort({ createdAt: -1 });

    const posts = savedPosts
      .map(sp => sp.postId)
      .filter(post => post !== null);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save post
router.post('/:postId', auth, async (req, res) => {
  try {
    const existing = await SavedPost.findOne({
      userId: req.userId,
      postId: req.params.postId,
    });

    if (existing) {
      await SavedPost.findByIdAndDelete(existing._id);
      res.json({ saved: false, message: 'Post unsaved' });
    } else {
      const savedPost = new SavedPost({
        userId: req.userId,
        postId: req.params.postId,
      });
      await savedPost.save();
      res.json({ saved: true, message: 'Post saved' });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Post already saved' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Check if post is saved
router.get('/:postId/check', auth, async (req, res) => {
  try {
    const savedPost = await SavedPost.findOne({
      userId: req.userId,
      postId: req.params.postId,
    });
    res.json({ saved: !!savedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

