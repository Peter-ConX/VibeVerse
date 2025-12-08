"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/BottomNav"
import StoriesBar from "@/components/StoriesBar"
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Volume2, VolumeX } from "lucide-react"
import ReactPlayer from "react-player"
import Image from "next/image"
import toast from "react-hot-toast"

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
    <div className="min-h-screen bg-black pb-20">
      {userId && <StoriesBar userId={userId} />}

      {/* Feed */}
      <div className="max-w-md mx-auto space-y-2 px-0">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 px-4">
            <p>No posts yet. Follow users to see their content!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post._id} className="bg-black border-b border-[#FFD84D]/5">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3 px-4">
                <div
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                  onClick={() => handleProfileClick(post.userId._id)}
                >
                  {post.userId.profilePicture ? (
                    <Image
                      src={post.userId.profilePicture || "/placeholder.svg"}
                      alt={post.userId.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2B014D] flex items-center justify-center text-[#FFD84D] font-bold text-sm">
                      {post.userId.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-white text-sm block">{post.userId.username}</span>
                    <span className="text-xs text-gray-400">15 minutes ago</span>
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400 hover:text-[#FFD84D] cursor-pointer" />
              </div>

              {/* Video */}
              <div className="relative w-full aspect-[9/16] bg-black">
                {post.videoUrl ? (
                  <div className="relative w-full h-full">
                    <ReactPlayer
                      url={post.videoUrl}
                      width="100%"
                      height="100%"
                      playing={playingIndex === index}
                      controls
                      muted={muted}
                      onPlay={() => {
                        fetch(`http://localhost:5000/api/posts/${post._id}/view`, {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                        })
                        setPlayingIndex(index)
                      }}
                    />
                    <button
                      onClick={() => setMuted(!muted)}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur rounded-full p-2 hover:bg-black/80"
                    >
                      {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-[#FFD84D]">No Video</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      disabled={likedPosts.has(post._id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-[#FFD84D] transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${likedPosts.has(post._id) ? "fill-[#FFD84D] text-[#FFD84D]" : ""}`}
                      />
                      <span className="text-xs">{post.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handleComment(post._id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-[#FFD84D] transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">{post.comments.length}</span>
                    </button>
                    <button
                      onClick={() => handleShare(post._id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-[#FFD84D] transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-xs">{post.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(post._id)}
                    className={`transition-colors ${savedPosts.has(post._id) ? "text-[#FFD84D]" : "text-gray-400 hover:text-[#FFD84D]"}`}
                  >
                    <Bookmark
                      className={`w-5 h-5 transition-all ${savedPosts.has(post._id) ? "fill-[#FFD84D]" : ""}`}
                    />
                  </button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div className="text-xs text-gray-300">
                    <span className="font-semibold text-white">{post.userId.username}</span>
                    <span className="text-gray-400"> {post.caption}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
