const express = require('express');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all active stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create story
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    let mediaUrl = '';

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'silicon/stories' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      mediaUrl = result.secure_url;
    }

    const story = new Story({
      userId: req.userId,
      mediaUrl,
    });

    await story.save();
    await story.populate('userId', 'username profilePicture');

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View story
router.post('/:storyId/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!story.views.includes(req.userId)) {
      story.views.push(req.userId);
      await story.save();
    }

    res.json({ views: story.views.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

