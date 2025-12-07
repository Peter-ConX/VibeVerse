# Silicon - Social Entertainment Platform

A Gen-Z style entertainment social platform combining YouTube, TikTok, and Instagram features.

## Features

- 🎥 Video posting and Shorts
- 📸 Stories (15-second)
- ❤️ Real-time likes, comments, shares
- 👥 Follow/Unfollow system
- 💬 Real-time messaging
- 🤖 AI Chat assistant
- 🎯 Personalized recommendation algorithm
- 🏆 Badge system (Yellow, Red, White)
- 🎨 Dark purple and yellow theme

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudinary
- **Auth**: JWT

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB and Cloudinary credentials
```

3. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on localhost:27017
```

4. Start the development server:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/              # Next.js app directory
├── server/           # Express backend
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── middleware/   # Auth middleware
├── components/       # React components
└── public/           # Static assets
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/shorts` - Get shorts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/Unlike post
- `POST /api/posts/:id/share` - Share post

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow/Unfollow user
- `GET /api/users/suggested/users` - Get suggested users

### Stories
- `GET /api/stories` - Get active stories
- `POST /api/stories` - Create story

### AI
- `POST /api/ai/chat` - Chat with AI

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## Badge System

- **Yellow Badge**: 500,000+ followers
- **Red Badge**: 1,000,000+ followers
- **White Badge**: 10,000,000+ followers

## License

MIT

