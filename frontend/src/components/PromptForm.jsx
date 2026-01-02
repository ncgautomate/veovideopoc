import React, { useState, useEffect } from 'react';

const PromptForm = ({ onSubmit, loading, initialData, onDataUsed }) => {
  const [formData, setFormData] = useState({
    prompt: '',
    negative_prompt: '',
    resolution: '720p',
    duration: 8,
    aspect_ratio: '16:9',
  });

  const [charCount, setCharCount] = useState(0);
  const [showTips, setShowTips] = useState(false);

  // Handle prefilling form with initial data (for regeneration)
  useEffect(() => {
    if (initialData) {
      setFormData({
        prompt: initialData.prompt || '',
        negative_prompt: initialData.negative_prompt || '',
        resolution: initialData.resolution || '720p',
        duration: initialData.duration || 8,
        aspect_ratio: initialData.aspect_ratio || '16:9',
      });
      setCharCount((initialData.prompt || '').length);

      // Notify parent that we've used the initial data
      if (onDataUsed) {
        onDataUsed();
      }
    }
  }, [initialData, onDataUsed]);

  const handlePromptChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4096) {
      setFormData({ ...formData, prompt: value });
      setCharCount(value.length);
    }
  };

  const handlePaste = (e) => {
    // Allow paste but truncate if exceeds limit
    const pastedText = e.clipboardData.getData('text');
    const currentText = formData.prompt;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = currentText.substring(0, cursorPosition);
    const textAfterCursor = currentText.substring(e.target.selectionEnd);
    const newText = textBeforeCursor + pastedText + textAfterCursor;

    if (newText.length > 4096) {
      e.preventDefault();
      const truncatedPaste = pastedText.substring(0, 4096 - textBeforeCursor.length - textAfterCursor.length);
      const finalText = textBeforeCursor + truncatedPaste + textAfterCursor;
      setFormData({ ...formData, prompt: finalText });
      setCharCount(finalText.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.prompt.trim()) {
      onSubmit(formData);
    }
  };

  const examplePrompts = [
    "A chef preparing pasta in a modern kitchen. \"This is my grandmother's recipe,\" the chef says warmly. Sound of sizzling garlic, smooth camera dolly from left to right.",
    "A golden retriever puppy running through a sunlit meadow. Birds chirping, gentle wind rustling grass. Slow-motion aerial shot, warm cinematic tones.",
    "City street at night with neon lights reflecting on wet pavement. Jazz music playing softly in the background. Smooth tracking shot, cyberpunk aesthetic."
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Tips Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-blue-900">
            💡 Prompt Engineering Tips
          </span>
          <svg
            className={`w-5 h-5 text-blue-600 transition-transform ${
              showTips ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showTips && (
          <div className="mt-3 space-y-2 text-sm text-blue-800">
            <p><strong>Include:</strong> Subject, Action, Style, Camera angle</p>
            <p><strong>Audio:</strong> Use quotes for dialogue, describe sound effects</p>
            <p><strong>Example:</strong></p>
            <p className="text-xs italic bg-white p-2 rounded">{examplePrompts[0]}</p>
          </div>
        )}
      </div>

      {/* Main Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Prompt *
        </label>
        <textarea
          value={formData.prompt}
          onChange={handlePromptChange}
          onPaste={handlePaste}
          placeholder="Describe your video with details about subject, action, style, camera movement, and audio..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          rows="5"
          required
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Include: Subject • Action • Style • Camera • Audio
          </div>
          <div className={`text-xs font-medium ${
            charCount > 1000 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {charCount}/4096
          </div>
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Negative Prompt (Optional)
        </label>
        <input
          type="text"
          value={formData.negative_prompt}
          onChange={(e) =>
            setFormData({ ...formData, negative_prompt: e.target.value })
          }
          placeholder="Elements to exclude from the video..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="mt-1 text-xs text-gray-500">
          Example: "blurry, low quality, distorted faces"
        </p>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resolution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution
          </label>
          <select
            value={formData.resolution}
            onChange={(e) =>
              setFormData({ ...formData, resolution: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="720p">720p (HD)</option>
            <option value="1080p">1080p (Full HD)</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="4">4 seconds</option>
            <option value="6">6 seconds</option>
            <option value="8">8 seconds</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio
          </label>
          <select
            value={formData.aspect_ratio}
            onChange={(e) =>
              setFormData({ ...formData, aspect_ratio: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.prompt.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          '🎬 Generate Video'
        )}
      </button>

      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
        <p className="font-medium mb-1">ℹ️ Processing Time:</p>
        <p>Video generation typically takes 11 seconds to 6 minutes. You'll see real-time progress updates.</p>
      </div>
    </form>
  );
};

export default PromptForm;
