import React from 'react'
import useAuthStore from '../../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function AdminHeader({ currentPage, onNavigate }) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const handleProfileClick = () => {
    // Navigate to admin profile page
    if (onNavigate) {
      onNavigate('profile')
    }
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'A'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left side - Admin welcome message */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              ADMIN
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome, <span className="text-purple-600">{user?.name || 'Admin'}</span>
            </h2>
          </div>
        </div>

        {/* Right side - Notification bell and Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            aria-label="Notifications"
          >
            {/* Bell Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            aria-label="Profile"
          >
            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {getInitials(user?.name)}
            </div>
            
            {/* User info - visible on larger screens */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                {user?.name || 'Admin'}
              </span>
              <span className="text-xs text-purple-600 font-medium">Administrator</span>
            </div>

            {/* Chevron down icon */}
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden md:block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

