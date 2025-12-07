const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 150,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  interests: {
    music: [String],
    movies: [String],
    sports: [String],
    contentTypes: [String],
  },
  badges: [{
    type: String,
    enum: ['yellow', 'red', 'white'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Update badges based on follower count
userSchema.methods.updateBadges = function() {
  const followerCount = this.followers.length;
  this.badges = [];
  if (followerCount >= 10000000) {
    this.badges.push('white');
  } else if (followerCount >= 1000000) {
    this.badges.push('red');
  } else if (followerCount >= 500000) {
    this.badges.push('yellow');
  }
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
