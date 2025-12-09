"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/BottomNav"
import StoriesBar from "@/components/StoriesBar"
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Volume2, VolumeX, Music } from "lucide-react"
import ReactPlayer from "react-player"
import Image from "next/image"
import toast from "react-hot-toast"
import { Toaster } from "react-hot-toast"

interface Post {
  _id: string
  userId: {
    _id: string
    username: string
    profilePicture: string
  }
  videoUrl: string
  thumbnail: string
  caption: string
  likes: string[]
  comments: string[]
  shares: number
  type: string
}

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [userId, setUserId] = useState("")
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const id = localStorage.getItem("userId")
    if (!token || !id) {
      router.push("/welcome")
      return
    }
    setUserId(id)
    fetchPosts()
  }, [router])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/posts/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setPosts(data)

      const liked = new Set<string>()
      data.forEach((post: Post) => {
        if (post.likes.includes(userId)) {
          liked.add(post._id)
        }
      })
      setLikedPosts(liked)

      const saved = new Set<string>()
      for (const post of data) {
        try {
          const savedResponse = await fetch(`http://localhost:5000/api/saved/${post._id}/check`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const savedData = await savedResponse.json()
          if (savedData.saved) {
            saved.add(post._id)
          }
        } catch (error) {
          // Ignore errors
        }
      }
      setSavedPosts(saved)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (likedPosts.has(postId)) {
      toast.error("You already liked this post")
      return
    }

    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, likes: [...post.likes, userId] } : post)))

      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        newSet.add(postId)
        return newSet
      })

      toast.success("Liked!")
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    }
  }

  const handleSave = async (postId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/saved/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      setSavedPosts((prev) => {
        const newSet = new Set(prev)
        if (data.saved) {
          newSet.add(postId)
          toast.success("Post saved")
        } else {
          newSet.delete(postId)
          toast.success("Post unsaved")
        }
        return newSet
      })
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error("Failed to save post")
    }
  }

  const handleComment = (postId: string) => {
    router.push(`/post/${postId}/comments`)
  }

  const handleShare = async (postId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      navigator.clipboard.writeText(data.shareUrl)
      toast.success("Link copied!")

      setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, shares: data.shares } : post)))
    } catch (error) {
      console.error("Error sharing post:", error)
      toast.error("Failed to share")
    }
  }

  const handleProfileClick = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD84D] text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <Toaster position="top-center" />

      {userId && <StoriesBar userId={userId} />}

      {/* TikTok-style feed */}
      <div className="flex flex-col items-center">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 px-4 pt-20">
            <p className="text-lg">No posts yet. Follow users to see their content!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post._id}
              className="relative w-full max-w-md h-screen flex items-center justify-center snap-center overflow-hidden"
            >
              {/* Video Background */}
              <div className="absolute inset-0 bg-black">
                {post.videoUrl ? (
                  // @ts-ignore - react-player types issue
                  <ReactPlayer
                    url={post.videoUrl}
                    width="100%"
                    height="100%"
                    playing={playingIndex === index}
                    controls={false}
                    muted={muted}
                    onPlay={() => {
                      fetch(`http://localhost:5000/api/posts/${post._id}/view`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      }).catch(() => {})
                      setPlayingIndex(index)
                    }}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2B014D] to-black flex items-center justify-center">
                    <div className="text-[#FFD84D] text-center">
                      <Music className="w-12 h-12 mx-auto mb-2" />
                      No Video
                    </div>
                  </div>
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none h-40" />

              {/* Left side - Creator info & caption */}
              <div className="absolute bottom-24 left-0 right-0 px-4 text-white z-10">
                <div
                  className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleProfileClick(post.userId._id)}
                >
                  {post.userId.profilePicture ? (
                    <Image
                      src={post.userId.profilePicture || "/placeholder.svg"}
                      alt={post.userId.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD84D]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2B014D] flex items-center justify-center text-[#FFD84D] font-bold border-2 border-[#FFD84D]">
                      {post.userId.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white">{post.userId.username}</div>
                    <div className="text-xs text-gray-300">Follow</div>
                  </div>
                </div>

                {post.caption && <p className="text-sm text-white line-clamp-2 mb-3">{post.caption}</p>}

                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span className="text-xs">Original Sound</span>
                </div>
              </div>

              {/* Right side - Action buttons (TikTok style) */}
              <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
                {/* Like button */}
                <button
                  onClick={() => handleLike(post._id)}
                  disabled={likedPosts.has(post._id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#2B014D]/80 backdrop-blur flex items-center justify-center group-hover:bg-[#2B014D] transition-all group-active:scale-95">
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        likedPosts.has(post._id)
                          ? "fill-[#2B014D] text-[#FFD84D]"
                          : "text-white group-hover:text-[#FFD84D]"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-white font-semibold">{post.likes.length}</span>
                </button>

                {/* Comment button */}
                <button onClick={() => handleComment(post._id)} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-[#2B014D]/80 backdrop-blur flex items-center justify-center group-hover:bg-[#2B014D] transition-all group-active:scale-95">
                    <MessageCircle className="w-6 h-6 text-white group-hover:text-[#FFD84D] transition-colors" />
                  </div>
                  <span className="text-xs text-white font-semibold">{post.comments.length}</span>
                </button>

                {/* Share button */}
                <button onClick={() => handleShare(post._id)} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-[#2B014D]/80 backdrop-blur flex items-center justify-center group-hover:bg-[#2B014D] transition-all group-active:scale-95">
                    <Share2 className="w-6 h-6 text-white group-hover:text-[#FFD84D] transition-colors" />
                  </div>
                  <span className="text-xs text-white font-semibold">{post.shares}</span>
                </button>

                {/* Save/Bookmark button */}
                <button onClick={() => handleSave(post._id)} className="flex flex-col items-center gap-1 group">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-active:scale-95 backdrop-blur ${
                      savedPosts.has(post._id) ? "bg-[#2B014D]" : "bg-[#2B014D]/80 group-hover:bg-[#2B014D]"
                    }`}
                  >
                    <Bookmark
                      className={`w-6 h-6 transition-all ${
                        savedPosts.has(post._id)
                          ? "fill-[#FFD84D] text-[#FFD84D]"
                          : "text-white group-hover:text-[#FFD84D]"
                      }`}
                    />
                  </div>
                </button>

                {/* Mute button */}
                <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-[#2B014D]/80 backdrop-blur flex items-center justify-center group-hover:bg-[#2B014D] transition-all group-active:scale-95">
                    {muted ? (
                      <VolumeX className="w-6 h-6 text-white group-hover:text-[#FFD84D] transition-colors" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-white group-hover:text-[#FFD84D] transition-colors" />
                    )}
                  </div>
                </button>
              </div>

              {/* More options button */}
              <button className="absolute top-4 right-4 bg-[#2B014D]/60 backdrop-blur rounded-full p-2 hover:bg-[#2B014D] z-20 transition-all">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
