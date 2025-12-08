"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Video, Plus, Users, User } from "lucide-react"
import { motion } from "framer-motion"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/shorts", icon: Video, label: "Shorts" },
    { path: "/create", icon: Plus, label: "Create" },
    { path: "/connect", icon: Users, label: "Connect" },
    { path: "/profile", icon: User, label: "Profile" },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2B014D]/90 backdrop-blur-lg border-t-2 border-[#FFD84D]/30 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-1 bg-[#FFD84D] rounded-b-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 transition-colors ${active ? "text-[#FFD84D]" : "text-gray-400 hover:text-[#FFD84D]"}`}
              />
              <span
                className={`text-xs mt-1 font-semibold transition-colors ${active ? "text-[#FFD84D]" : "text-gray-400"}`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
