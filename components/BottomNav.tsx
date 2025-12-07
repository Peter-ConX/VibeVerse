'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Video, Plus, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/shorts', icon: Video, label: 'Shorts' },
    { path: '/create', icon: Plus, label: 'Create' },
    { path: '/connect', icon: Users, label: 'Connect' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-lg border-t border-primary/50 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 transition-colors ${
                  active ? 'text-accent' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors ${
                  active ? 'text-accent' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

