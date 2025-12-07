const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ userId: req.params.userId });
    const shorts = await Post.find({ userId: req.params.userId, type: 'short' });

    res.json({
      ...user.toObject(),
      postsCount: posts.length,
      shortsCount: shorts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const user = await User.findById(req.userId);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.following.includes(req.params.userId);

    if (isFollowing) {
      user.following = user.following.filter(id => id.toString() !== req.params.userId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.userId);
    } else {
      user.following.push(req.params.userId);
      targetUser.followers.push(req.userId);
    }

    await user.save();
    await targetUser.save();
    targetUser.updateBadges();
    await targetUser.save();

    res.json({ 
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get suggested users
router.get('/suggested/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const followingIds = [...user.following, req.userId];

    // Find users with similar interests
    const suggestedUsers = await User.find({
      _id: { $nin: followingIds },
      $or: [
        { 'interests.music': { $in: user.interests.music } },
        { 'interests.movies': { $in: user.interests.movies } },
        { 'interests.sports': { $in: user.interests.sports } },
      ],
    })
      .select('username profilePicture bio followers badges')
      .limit(20)
      .sort({ 'followers': -1 });

    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user interests
router.put('/interests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.interests = req.body;
    await user.save();

    res.json(user.interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

