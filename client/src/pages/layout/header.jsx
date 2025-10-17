import React from 'react'

export default function Header({ currentPage, onNavigate }) {
  return (
    <header className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            {/* Circular pill emblem */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <title>Pill icon</title>
              <g fill="none" fillRule="evenodd">
                <circle cx="12" cy="12" r="10" fill="#ec4899" opacity="0.14" />
                <path d="M7.05 9.05a4 4 0 015.657 0l2.243 2.243a4 4 0 010 5.657 4 4 0 01-5.657 0L7.05 14.707a4 4 0 010-5.657z" fill="#fff" />
                <rect x="6.5" y="6.5" width="11" height="5" rx="2.5" transform="rotate(45 12 9)" fill="#fff" opacity="0.9" />
              </g>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Pillgenious</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <button className="hover:text-teal-200 transition-colors">Home</button>
          <button className="hover:text-teal-200 transition-colors">Products</button>
          <button className="hover:text-teal-200 transition-colors">Brands</button>
          <button className="hover:text-teal-200 transition-colors">Features</button>
          <button className="hover:text-teal-200 transition-colors">Alerts</button>
          <button className="hover:text-teal-200 transition-colors">Blogs</button>
          <button className="hover:text-teal-200 transition-colors">Consultation</button>
          <button
            onClick={() => onNavigate && onNavigate('login')}
            className={currentPage === 'login' ? 'text-teal-200 font-semibold' : 'hover:text-teal-200 transition-colors'}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  )
}
