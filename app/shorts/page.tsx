"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/BottomNav"
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from "lucide-react"
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
}

export default function ShortsPage() {
  const router = useRouter()
  const [shorts, setShorts] = useState<Post[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set())
  const [savedShorts, setSavedShorts] = useState<Set<string>>(new Set())
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const id = localStorage.getItem("userId")
    if (!token || !id) {
      router.push("/welcome")
      return
    }
    setUserId(id)
    fetchShorts()
  }, [router])

  const fetchShorts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/posts/shorts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setShorts(data)

      const liked = new Set<string>()
      data.forEach((short: Post) => {
        if (short.likes.includes(userId)) {
          liked.add(short._id)
        }
      })
      setLikedShorts(liked)

      const saved = new Set<string>()
      for (const short of data) {
        try {
          const savedResponse = await fetch(`http://localhost:5000/api/saved/${short._id}/check`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const savedData = await savedResponse.json()
          if (savedData.saved) {
            saved.add(short._id)
          }
        } catch (error) {
          // Ignore
        }
      }
      setSavedShorts(saved)
    } catch (error) {
      console.error("Error fetching shorts:", error)
      toast.error("Failed to load shorts")
    }
  }

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleLike = async (shortId: string) => {
    if (likedShorts.has(shortId)) {
      toast.error("You already liked this short")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/posts/${shortId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      setShorts((prev) =>
        prev.map((short) => (short._id === shortId ? { ...short, likes: [...short.likes, userId] } : short)),
      )

      setLikedShorts((prev) => {
        const newSet = new Set(prev)
        newSet.add(shortId)
        return newSet
      })

      toast.success("Liked!")
    } catch (error) {
      toast.error("Failed to like")
    }
  }

  const handleSave = async (shortId: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:5000/api/saved/${shortId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setSavedShorts((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(shortId)) {
          newSet.delete(shortId)
          toast.success("Unsaved")
        } else {
          newSet.add(shortId)
          toast.success("Saved!")
        }
        return newSet
      })
    } catch (error) {
      toast.error("Failed to save")
    }
  }

  const handleComment = (shortId: string) => {
    router.push(`/post/${shortId}/comments`)
  }

  const handleShare = async (shortId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/posts/${shortId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      navigator.clipboard.writeText(data.shareUrl)
      toast.success("Link copied!")

      setShorts((prev) => prev.map((short) => (short._id === shortId ? { ...short, shares: data.shares } : short)))
    } catch (error) {
      toast.error("Failed to share")
    }
  }

  if (shorts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black flex items-center justify-center pb-20">
        <div className="text-[#FFD84D] text-lg">No shorts available</div>
        <BottomNav />
      </div>
    )
  }

  const currentShort = shorts[currentIndex]

  return (
    <div ref={containerRef} onWheel={handleScroll} className="h-screen overflow-hidden bg-black pb-20">
      <div className="h-full flex items-center justify-center relative">
        <div className="w-full h-full max-w-md mx-auto relative">
          {currentShort && (
            <>
              <div className="absolute inset-0">
                {currentShort.videoUrl ? (
                  <ReactPlayer
                    url={currentShort.videoUrl}
                    width="100%"
                    height="100%"
                    playing={playing}
                    loop
                    controls={false}
                    muted={muted}
                    onPlay={() => {
                      fetch(`http://localhost:5000/api/posts/${currentShort._id}/view`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      })
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#2B014D]/20 flex items-center justify-center">
                    <div className="text-[#FFD84D] text-2xl">No Video</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMuted(!muted)}
                className="absolute top-4 right-4 bg-black/60 rounded-full p-2 hover:bg-black/80 transition-all"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-[#FFD84D]" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#FFD84D]" />
                )}
              </button>

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  {currentShort.userId.profilePicture ? (
                    <Image
                      src={currentShort.userId.profilePicture || "/placeholder.svg"}
                      alt={currentShort.userId.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#FFD84D]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2B014D] flex items-center justify-center text-[#FFD84D] font-bold">
                      {currentShort.userId.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-white">{currentShort.userId.username}</span>
                </div>
                {currentShort.caption && <p className="text-sm text-gray-300">{currentShort.caption}</p>}
              </div>

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-6">
                <button
                  onClick={() => handleLike(currentShort._id)}
                  disabled={likedShorts.has(currentShort._id)}
                  className="flex flex-col items-center hover:opacity-80 transition-opacity"
                >
                  <div className="bg-black/60 rounded-full p-3 hover:bg-black/80">
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        likedShorts.has(currentShort._id) ? "fill-[#FFD84D] text-[#FFD84D]" : "text-white"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-[#FFD84D] mt-2 font-semibold">{currentShort.likes.length}</span>
                </button>
                <button onClick={() => handleComment(currentShort._id)} className="flex flex-col items-center">
                  <div className="bg-black/60 rounded-full p-3 hover:bg-black/80">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-[#FFD84D] mt-2 font-semibold">{currentShort.comments.length}</span>
                </button>
                <button onClick={() => handleShare(currentShort._id)} className="flex flex-col items-center">
                  <div className="bg-black/60 rounded-full p-3 hover:bg-black/80">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-[#FFD84D] mt-2 font-semibold">{currentShort.shares}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
