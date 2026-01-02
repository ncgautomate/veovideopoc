import React, { useState, useMemo } from 'react';
import { promptTemplates, searchTemplates } from '../data/promptTemplates';

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('cinematic');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Get filtered templates based on search or category
  const displayTemplates = useMemo(() => {
    if (isSearchMode && searchQuery.trim()) {
      return searchTemplates(searchQuery);
    }
    return promptTemplates[activeCategory]?.templates || [];
  }, [activeCategory, searchQuery, isSearchMode]);

  const handleTemplateSelect = (template) => {
    onSelectTemplate({
      prompt: template.prompt,
      ...template.settings
    });
    onClose();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchMode(value.trim().length > 0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-6xl max-h-[90vh] flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Template Library
            </h2>
            <p className="text-sm text-gray-600 mt-1">Choose a ready-made prompt to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-smooth"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search templates by name, description, or tags..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-smooth shadow-soft text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchMode(false);
                }}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-smooth"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs - Hidden when searching */}
        {!isSearchMode && (
          <div className="px-6 py-3 border-b border-gray-200 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {Object.entries(promptTemplates).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-smooth transform hover:scale-105 whitespace-nowrap ${
                    activeCategory === key
                      ? `bg-gradient-to-r ${category.color} text-white shadow-medium`
                      : 'text-gray-700 hover:bg-gray-100 shadow-soft'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearchMode && searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{displayTemplates.length}</span> template{displayTemplates.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            </div>
          )}

          {displayTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-sm text-gray-600">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-medium transition-smooth bg-white group cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-soft group-hover:shadow-medium transition-smooth transform group-hover:scale-110">
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-smooth">
                          {template.name}
                        </h3>
                        {isSearchMode && template.category && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <span className="mr-1">{template.categoryIcon}</span>
                            {template.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
                    {template.prompt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Settings Preview */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {template.settings.resolution}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {template.settings.duration}s
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{template.settings.aspectRatio}</span>
                    </div>
                  </div>

                  {/* Hover Button */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow-medium transform hover:scale-[1.02] transition-smooth">
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isSearchMode
              ? `${displayTemplates.length} template${displayTemplates.length !== 1 ? 's' : ''} found`
              : `${displayTemplates.length} template${displayTemplates.length !== 1 ? 's' : ''} in ${promptTemplates[activeCategory]?.name || 'this category'}`
            }
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 shadow-soft hover:shadow-medium transition-smooth"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
