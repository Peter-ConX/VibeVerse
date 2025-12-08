"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Story {
  _id: string
  userId: {
    _id: string
    username: string
    profilePicture: string
  }
  mediaUrl: string
  views: string[]
}

export default function StoriesBar({ userId }: { userId: string }) {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/stories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setStories(data)
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
      <div
        onClick={() => router.push("/create?type=story")}
        className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFD84D] to-[#2B014D] p-0.5 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-black p-1">
            <div className="w-full h-full rounded-full bg-[#2B014D] flex items-center justify-center group-hover:bg-[#3D0266] transition-colors">
              <Plus className="w-6 h-6 text-[#FFD84D]" />
            </div>
          </div>
        </div>
        <span className="text-xs text-[#FFD84D] mt-2 font-semibold">Your Story</span>
      </div>

      {/* Stories */}
      {stories.map((story) => (
        <div key={story._id} className="flex-shrink-0 flex flex-col items-center cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFD84D] to-[#2B014D] p-0.5 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-black p-0.5">
              <div className="w-full h-full rounded-full bg-[#2B014D] overflow-hidden">
                {story.userId.profilePicture ? (
                  <Image
                    src={story.userId.profilePicture || "/placeholder.svg"}
                    alt={story.userId.username}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2B014D] flex items-center justify-center text-[#FFD84D] font-bold">
                    {story.userId.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-2 truncate max-w-[64px] group-hover:text-[#FFD84D] transition-colors font-semibold">
            {story.userId.username}
          </span>
        </div>
      ))}
    </div>
  )
}
