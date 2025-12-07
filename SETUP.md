# Silicon - Setup Guide

## Step 1: Install Dependencies

Dependencies are being installed. Wait for it to complete.

## Step 2: MongoDB Setup

You have two options:

### Option A: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (choose the FREE tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `silicon_user` (or your choice)
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Atlas Admin"
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `silicon` (or your choice)

### Option B: Local MongoDB

1. Download MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Install MongoDB on your system
3. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
4. Your connection string will be: `mongodb://localhost:27017/silicon`

## Step 3: Cloudinary Setup (For Image/Video Storage)

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a FREE account
3. After signing up, you'll see your Dashboard
4. Copy these credentials from your Dashboard:
   - **Cloud Name**: Found at the top of your dashboard (e.g., `dxyz123abc`)
   - **API Key**: Found in "Account Details" → "API Keys" section
   - **API Secret**: Found in "Account Details" → "API Keys" section (click "Reveal")

## Step 4: Create .env File

1. Copy the `.env.example` file to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Open `.env` and fill in your credentials:

\`\`\`env
# MongoDB
# For MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/silicon?retryWrites=true&w=majority

# For Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/silicon

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-secure

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here

# Server Port (default: 5000)
PORT=5000

# Frontend URL (default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000
\`\`\`

### Generate JWT Secret

You can generate a random JWT secret using:
- Online: [randomkeygen.com](https://randomkeygen.com/)
- Or use: `openssl rand -base64 32` in terminal

## Step 5: Start the Application

### Terminal 1 - Backend Server
\`\`\`bash
npm run server
\`\`\`

You should see:
\`\`\`
✅ MongoDB connected
🚀 Server running on http://localhost:5000
\`\`\`

### Terminal 2 - Frontend (Next.js)
\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
✓ Ready in X seconds
○ Local: http://localhost:3000
\`\`\`

## Step 6: Open the App

Open your browser and go to: [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running (if using local)
- Check your connection string is correct
- For Atlas: Make sure your IP is whitelisted
- For Atlas: Make sure you replaced `<password>` in the connection string

### Cloudinary Issues
- Double-check your Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces in your .env file
- Cloudinary free tier has limits but should be enough for development

### Port Already in Use
- If port 5000 is taken, change `PORT=5000` in `.env` to another port (e.g., `5001`)
- If port 3000 is taken, Next.js will automatically use 3001

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Cloudinary Docs: https://cloudinary.com/documentation
- Next.js Docs: https://nextjs.org/docs
