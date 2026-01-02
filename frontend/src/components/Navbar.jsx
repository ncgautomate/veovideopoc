import React from 'react';

const Navbar = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-medium">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-medium transform hover:scale-105 transition-smooth">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">CleverCreator.ai</h1>
            <p className="text-xs text-gray-600 font-medium">Powered by Veo 3.1</p>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => onViewChange('studio')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth transform hover:scale-105 ${
              currentView === 'studio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-medium'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-soft'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Studio
            </span>
          </button>
          <button
            onClick={() => onViewChange('gallery')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth transform hover:scale-105 ${
              currentView === 'gallery'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-medium'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-soft'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Gallery
            </span>
          </button>
          <button
            onClick={() => onViewChange('library')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth transform hover:scale-105 ${
              currentView === 'library'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-medium'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-soft'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Community
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="hidden sm:flex items-center px-3.5 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-full shadow-soft">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse shadow-sm"></span>
            <span className="text-xs font-semibold text-green-700">Online</span>
          </div>
          <button className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-smooth shadow-soft hover:shadow-medium transform hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-smooth shadow-soft hover:shadow-medium transform hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 border-t-2 border-gray-200 bg-white/95 backdrop-blur-sm shadow-large">
        <div className="flex divide-x divide-gray-200">
          <button
            onClick={() => onViewChange('studio')}
            className={`flex-1 py-3 text-xs font-semibold transition-smooth ${
              currentView === 'studio' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onViewChange('gallery')}
            className={`flex-1 py-3 text-xs font-semibold transition-smooth ${
              currentView === 'gallery' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => onViewChange('library')}
            className={`flex-1 py-3 text-xs font-semibold transition-smooth ${
              currentView === 'library' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Community
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
