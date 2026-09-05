'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()

  return (
    <nav className="bg-[#0B1736] border-b border-gray-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-[#FFD700] tracking-wider">FeniX</span>
              <span className="text-xs bg-[#008080] text-white px-2 py-0.5 rounded-full font-medium">Ecosystem</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-[#FFD700] transition-colors">হোম</Link>
            <Link href="/directory" className="hover:text-[#FFD700] transition-colors">বিজনেস ডিরেক্টরি</Link>
            <Link href="/invest" className="hover:text-[#FFD700] transition-colors">ইনভেস্টমেন্ট</Link>
          </div>

          {/* User Auth Corner */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-amber-500/20 text-[#FFD700] border border-[#FFD700]/30 px-2 py-1 rounded capitalize">
                  {role}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{user.email}</span>
                <button
                  onClick={logout}
                  className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#008080] hover:bg-[#006666] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                লগইন করুন
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
      }
