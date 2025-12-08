"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/BottomNav"
import { Edit, Grid3x3, Video, Bookmark, LogOut } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface User {
  _id: string
  username: string
  email: string
  profilePicture: string
  bio: string
  followers: string[]
  following: string[]
  badges: string[]
  postsCount: number
  shortsCount: number
}

interface Post {
  _id: string
  videoUrl: string
  thumbnail: string
  caption: string
  type: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "shorts" | "saved">("posts")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    if (!token || !userId) {
      router.push("/welcome")
      return
    }
    fetchProfile(userId)
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setUser(data)

      const postsResponse = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const postsData = await postsResponse.json()
      setPosts(postsData)

      const savedResponse = await fetch("http://localhost:5000/api/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const savedData = await savedResponse.json()
      setSavedPosts(savedData)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/welcome")
    toast.success("Logged out!")
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black flex items-center justify-center pb-20">
        <div className="text-[#FFD84D] text-xl animate-pulse">Loading...</div>
        <BottomNav />
      </div>
    )
  }

  const displayedPosts =
    activeTab === "posts"
      ? posts.filter((p) => p.type === "video")
      : activeTab === "shorts"
        ? posts.filter((p) => p.type === "short")
        : savedPosts

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black pb-20">
      <div className="p-4 flex items-center justify-between border-b border-[#FFD84D]/20">
        <h1 className="text-2xl font-bold text-[#FFD84D]">{user.username}</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleEditProfile} title="Edit Profile" className="hover:text-[#FFD84D] transition-colors">
            <Edit className="w-6 h-6 text-[#FFD84D]" />
          </button>
          <button onClick={handleLogout} title="Logout" className="hover:text-red-400 transition-colors">
            <LogOut className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user.profilePicture ? (
            <Image
              src={user.profilePicture || "/placeholder.svg"}
              alt={user.username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-3 border-[#FFD84D]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#2B014D] flex items-center justify-center text-[#FFD84D] text-2xl font-bold border-3 border-[#FFD84D]">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-bold text-white">{user.username}</span>
              {user.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`w-5 h-5 rounded-full ${
                    badge === "white" ? "bg-white" : badge === "red" ? "bg-red-500" : "bg-[#FFD84D]"
                  }`}
                  title={`${badge} badge`}
                />
              ))}
            </div>
            {user.bio && <p className="text-gray-400 text-sm">{user.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4 bg-[#2B014D]/40 p-4 rounded-lg border border-[#FFD84D]/20">
          <button className="text-center hover:opacity-80 transition-opacity">
            <div className="text-xl font-bold text-[#FFD84D]">{user.postsCount}</div>
            <div className="text-sm text-gray-400">Posts</div>
          </button>
          <button className="text-center hover:opacity-80 transition-opacity">
            <div className="text-xl font-bold text-[#FFD84D]">{user.followers.length}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </button>
          <button className="text-center hover:opacity-80 transition-opacity">
            <div className="text-xl font-bold text-[#FFD84D]">{user.following.length}</div>
            <div className="text-sm text-gray-400">Following</div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#FFD84D]/30 px-4 mb-4">
        {(["posts", "shorts", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-bold transition-all text-center ${
              activeTab === tab ? "text-[#FFD84D] border-b-2 border-[#FFD84D]" : "text-gray-400"
            }`}
          >
            {tab === "posts" && <Grid3x3 className="w-5 h-5 inline mr-2" />}
            {tab === "shorts" && <Video className="w-5 h-5 inline mr-2" />}
            {tab === "saved" && <Bookmark className="w-5 h-5 inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="px-4">
        {displayedPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No {activeTab} yet</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayedPosts.map((post) => (
              <div
                key={post._id}
                className="aspect-square bg-[#2B014D]/30 rounded overflow-hidden relative group cursor-pointer"
              >
                {post.thumbnail ? (
                  <Image
                    src={post.thumbnail || "/placeholder.svg"}
                    alt={post.caption || "Post"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2B014D]/30">
                    <Video className="w-8 h-8 text-[#FFD84D]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Video className="w-8 h-8 text-[#FFD84D] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
