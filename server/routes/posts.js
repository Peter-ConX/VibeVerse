const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
});

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Get feed posts
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const followingIds = [...user.following, req.userId];
    
    const posts = await Post.find({ userId: { $in: followingIds } })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shorts
router.get('/shorts', auth, async (req, res) => {
  try {
    const shorts = await Post.find({ type: 'short' })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(shorts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    const { type, caption, hashtags, music } = req.body;
    let videoUrl = '';
    let thumbnail = '';

    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'video', folder: 'silicon/posts' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      videoUrl = result.secure_url;
      thumbnail = result.secure_url.replace('.mp4', '.jpg');
    }

    const post = new Post({
      userId: req.userId,
      type: type || 'video',
      videoUrl,
      thumbnail,
      caption,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      music: music ? JSON.parse(music) : {},
    });

    await post.save();
    await post.populate('userId', 'username profilePicture');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share post
router.post('/:postId/share', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.json({ shares: post.shares, shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/post/${post._id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment views
router.post('/:postId/view', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json({ views: post.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment replays
router.post('/:postId/replay', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.replays += 1;
    await post.save();

    res.json({ replays: post.replays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
