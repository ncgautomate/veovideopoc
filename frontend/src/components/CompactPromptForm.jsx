import React, { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';

const CompactPromptForm = ({ onSubmit, loading, initialData, onDataUsed, onImageUploaded, imageFile, uploadingImage, promptFromChat, onChatPromptUsed }) => {
  const [formData, setFormData] = useState({
    prompt: '',
    negative_prompt: '',
    resolution: '720p',
    duration: 8,
    aspect_ratio: '16:9',
  });

  const [charCount, setCharCount] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAIOptimizer, setShowAIOptimizer] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showEnhancedControls, setShowEnhancedControls] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [cameraMotion, setCameraMotion] = useState('');
  const [videoStyle, setVideoStyle] = useState('');
  const [mood, setMood] = useState('');
  const [optimizerInputs, setOptimizerInputs] = useState({
    additionalDetails: '',
    mood: '',
    cameraStyle: '',
    audioStyle: ''
  });
  const [optimizing, setOptimizing] = useState(false);

  // Handle prompt from chat assistant
  useEffect(() => {
    if (promptFromChat) {
      const truncatedPrompt = promptFromChat.substring(0, 4096);
      setFormData({ ...formData, prompt: truncatedPrompt });
      setCharCount(truncatedPrompt.length);
      if (onChatPromptUsed) onChatPromptUsed();
    }
  }, [promptFromChat, onChatPromptUsed]);

  // Create image preview URL when image is uploaded
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);

      // Cleanup: revoke the object URL when component unmounts or image changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

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
      if (onDataUsed) onDataUsed();
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

  const handleTemplateSelect = (templateData) => {
    // Apply template data to form
    setFormData({
      ...formData,
      prompt: templateData.prompt,
      resolution: templateData.resolution || formData.resolution,
      duration: templateData.duration || formData.duration,
      aspect_ratio: templateData.aspectRatio || formData.aspect_ratio,
    });
    setCharCount(templateData.prompt.length);
  };

  // Auto-enhance prompt with selected controls
  const enhancePromptWithControls = () => {
    if (!formData.prompt.trim()) return;

    let enhancedPrompt = formData.prompt;
    const additions = [];

    // Add camera motion
    if (cameraMotion) {
      const motionDescriptions = {
        'pan-right': 'smooth cinematic pan from left to right',
        'pan-left': 'smooth cinematic pan from right to left',
        'zoom-in': 'slow zoom in towards subject',
        'zoom-out': 'slow zoom out revealing environment',
        'orbit': 'orbital camera movement circling around subject',
        'tracking': 'tracking shot following the movement',
        'dolly-forward': 'dolly push forward towards subject',
        'crane-up': 'crane camera movement rising upward',
        'handheld': 'natural handheld camera with subtle shake',
        'static': 'static locked camera, no movement'
      };
      if (motionDescriptions[cameraMotion]) {
        additions.push(motionDescriptions[cameraMotion]);
      }
    }

    // Add video style
    if (videoStyle) {
      const styleDescriptions = {
        'cinematic': 'cinematic film look with anamorphic bokeh and film grain',
        'documentary': 'documentary style natural lighting',
        'anime': 'anime art style with vibrant colors',
        'vintage': 'vintage 8mm film aesthetic with vignetting',
        'drone': 'aerial drone footage perspective',
        'timelapse': 'time-lapse effect with accelerated motion',
        'slow-motion': 'slow motion capture at high frame rate',
        'music-video': 'dynamic music video aesthetic'
      };
      if (styleDescriptions[videoStyle]) {
        additions.push(styleDescriptions[videoStyle]);
      }
    }

    // Add mood
    if (mood) {
      const moodDescriptions = {
        'dramatic': 'dramatic high contrast lighting',
        'peaceful': 'peaceful soft diffused lighting',
        'suspenseful': 'dark moody atmospheric lighting',
        'energetic': 'vibrant saturated colors with dynamic energy',
        'nostalgic': 'warm nostalgic color grading',
        'futuristic': 'neon cyberpunk futuristic aesthetic',
        'romantic': 'golden hour romantic lighting'
      };
      if (moodDescriptions[mood]) {
        additions.push(moodDescriptions[mood]);
      }
    }

    // Append additions to prompt
    if (additions.length > 0) {
      enhancedPrompt += ', ' + additions.join(', ');
      setFormData({ ...formData, prompt: enhancedPrompt });
      setCharCount(enhancedPrompt.length);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!formData.prompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    setOptimizing(true);
    try {
      // Build optimization request with user inputs
      const optimizationContext = {
        original_prompt: formData.prompt,
        additional_details: optimizerInputs.additionalDetails,
        mood: optimizerInputs.mood,
        camera_style: optimizerInputs.cameraStyle,
        audio_style: optimizerInputs.audioStyle
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
      const endpoint = `${backendUrl}/api/optimize-prompt`;

      console.log('🔍 Sending optimization request to:', endpoint);
      console.log('📝 Request body:', optimizationContext);

      // Call AI optimization API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationContext)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to optimize prompt');
      }

      const result = await response.json();

      // Update prompt with optimized version
      setFormData({ ...formData, prompt: result.optimized_prompt });
      setCharCount(result.optimized_prompt.length);

      // Close optimizer modal
      setShowAIOptimizer(false);

      // Reset optimizer inputs
      setOptimizerInputs({
        additionalDetails: '',
        mood: '',
        cameraStyle: '',
        audioStyle: ''
      });
    } catch (err) {
      alert('Failed to optimize prompt: ' + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AI Mode Indicator */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl animate-fadeIn">
        <div className="flex items-center space-x-3">
          {imageFile ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-medium">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900">Image to Video</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Active</span>
                </div>
                <p className="text-xs text-gray-600">Using reference image + text prompt</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-medium">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900">Text to Video</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Active</span>
                </div>
                <p className="text-xs text-gray-600">Generate from text prompt only</p>
              </div>
            </>
          )}
        </div>
        <span className="text-xs text-gray-500 font-medium">Veo 3.1</span>
      </div>

      {/* Optional Image Upload - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-smooth">
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="w-full px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 flex items-center justify-between text-sm font-semibold text-gray-700 transition-smooth"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {imageFile ? 'Reference Image' : 'Add Reference Image (Optional)'}
            {imageFile && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">✓ Uploaded</span>}
          </span>
          <svg className={`w-5 h-5 transition-transform duration-300 ${showImageUpload ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showImageUpload && (
          <div className="p-5 border-t border-gray-200 bg-gray-50/50 animate-fadeIn">
            {uploadingImage ? (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-blue-300 shadow-soft">
                <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600 font-medium">Uploading...</p>
              </div>
            ) : imageFile ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4 shadow-soft animate-fadeIn">
                <div className="flex items-start space-x-4">
                  {/* Thumbnail Preview - Clickable */}
                  {imagePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      className="flex-shrink-0 group relative overflow-hidden rounded-lg shadow-medium hover:shadow-large transition-smooth transform hover:scale-105"
                      title="Click to view full size"
                    >
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold text-green-900">Image Uploaded</span>
                        </div>
                        <p className="text-xs text-green-800 truncate">{imageFile.name}</p>
                        <p className="text-xs text-green-600 mt-1">Click thumbnail to preview</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onImageUploaded(null)}
                        className="ml-2 text-xs text-red-600 hover:text-red-700 font-semibold hover:underline transition-fast flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUploaded(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 transition-smooth shadow-soft hover:shadow-medium">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-xs text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG or JPEG up to 20MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prompt Input - Compact with AI Optimizer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-800">
            Video Prompt *
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-medium hover:shadow-large transition-smooth transform hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Templates
            </button>
            <button
              type="button"
              onClick={() => setShowAIOptimizer(true)}
              className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white text-xs font-semibold rounded-lg shadow-medium hover:shadow-large transition-smooth transform hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Optimize
            </button>
          </div>
        </div>
        <textarea
          value={formData.prompt}
          onChange={handlePromptChange}
          onPaste={handlePaste}
          placeholder="Describe your video: subject, action, style, camera, audio..."
          className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y transition-smooth min-h-[110px] shadow-soft hover:shadow-medium"
          rows="4"
          required
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-600 font-medium">Include: Subject • Action • Style • Camera • Audio • Drag to resize ↕</p>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${charCount > 3800 ? 'text-red-600 bg-red-100' : charCount > 3000 ? 'text-yellow-700 bg-yellow-100' : 'text-gray-600 bg-gray-100'}`}>
            {charCount}/4096
          </span>
        </div>
      </div>

      {/* Quick Settings - Inline */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Resolution</label>
          <select
            value={formData.resolution}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            className="w-full px-3 py-2 text-xs font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-soft hover:shadow-medium transition-smooth bg-white"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Duration</label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-soft hover:shadow-medium transition-smooth bg-white"
          >
            <option value="4">4s</option>
            <option value="6">6s</option>
            <option value="8">8s</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Aspect</label>
          <select
            value={formData.aspect_ratio}
            onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value })}
            className="w-full px-3 py-2 text-xs font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-soft hover:shadow-medium transition-smooth bg-white"
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
          </select>
        </div>
      </div>

      {/* Enhanced Controls - Camera & Style */}
      <div className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-smooth bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <button
          type="button"
          onClick={() => setShowEnhancedControls(!showEnhancedControls)}
          className="w-full px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 flex items-center justify-between text-sm font-semibold text-gray-800 transition-smooth"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Camera & Style Controls
            {(cameraMotion || videoStyle || mood) && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                {[cameraMotion, videoStyle, mood].filter(Boolean).length} active
              </span>
            )}
          </span>
          <svg className={`w-5 h-5 transition-transform duration-300 ${showEnhancedControls ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showEnhancedControls && (
          <div className="p-5 border-t border-purple-200 bg-white/50 animate-fadeIn space-y-4">
            {/* Camera Motion */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Camera Motion</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-soft hover:shadow-medium transition-smooth bg-white"
              >
                <option value="">None</option>
                <option value="pan-right">Pan Right →</option>
                <option value="pan-left">← Pan Left</option>
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
                <option value="orbit">Orbit Around</option>
                <option value="tracking">Tracking Shot</option>
                <option value="dolly-forward">Dolly Forward</option>
                <option value="crane-up">Crane Up ↑</option>
                <option value="handheld">Handheld</option>
                <option value="static">Static (No Movement)</option>
              </select>
            </div>

            {/* Video Style */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Video Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cinematic', label: 'Cinematic', icon: '🎬' },
                  { value: 'documentary', label: 'Documentary', icon: '📹' },
                  { value: 'anime', label: 'Anime', icon: '🎌' },
                  { value: 'vintage', label: 'Vintage', icon: '📼' },
                  { value: 'drone', label: 'Drone', icon: '🚁' },
                  { value: 'timelapse', label: 'Timelapse', icon: '⏱️' },
                  { value: 'slow-motion', label: 'Slow Motion', icon: '🐌' },
                  { value: 'music-video', label: 'Music Video', icon: '🎵' }
                ].map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setVideoStyle(videoStyle === style.value ? '' : style.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-smooth transform hover:scale-105 ${
                      videoStyle === style.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-medium'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    <span className="mr-1">{style.icon}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood/Atmosphere */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Mood & Atmosphere</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-soft hover:shadow-medium transition-smooth bg-white"
              >
                <option value="">None</option>
                <option value="dramatic">Dramatic</option>
                <option value="peaceful">Peaceful</option>
                <option value="suspenseful">Suspenseful</option>
                <option value="energetic">Energetic</option>
                <option value="nostalgic">Nostalgic</option>
                <option value="futuristic">Futuristic</option>
                <option value="romantic">Romantic</option>
              </select>
            </div>

            {/* Apply Button */}
            {(cameraMotion || videoStyle || mood) && (
              <button
                type="button"
                onClick={enhancePromptWithControls}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 shadow-medium hover:shadow-large transition-smooth transform hover:scale-[1.02]"
              >
                Apply to Prompt
              </button>
            )}

            <p className="text-xs text-gray-600 italic">
              💡 Select controls and click "Apply to Prompt" to enhance your video description
            </p>
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-medium text-gray-700 transition-all"
        >
          <span className="flex items-center">
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Advanced Settings
          </span>
          <svg className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="p-3 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Negative Prompt (Optional)</label>
              <input
                type="text"
                value={formData.negative_prompt}
                onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
                placeholder="Elements to exclude..."
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Example: blurry, low quality, distorted</p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.prompt.trim()}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-3.5 px-6 rounded-xl text-base font-bold hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-smooth shadow-large hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generate Video
          </>
        )}
      </button>

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl p-3.5 shadow-soft">
        <p className="text-sm font-semibold flex items-center text-blue-900">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Generation takes 11s - 6min
        </p>
      </div>

      {/* AI Prompt Optimizer Modal */}
      {showAIOptimizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-bold">AI Prompt Optimizer</h3>
              </div>
              <button
                onClick={() => setShowAIOptimizer(false)}
                className="text-white hover:text-gray-200 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 mb-1">Current Prompt:</p>
                <p className="text-sm text-purple-800 italic">{formData.prompt}</p>
              </div>

              <p className="text-sm text-gray-600">
                Provide additional details below to help AI create the ultimate video prompt optimized for best results.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Details & Requirements
                </label>
                <textarea
                  value={optimizerInputs.additionalDetails}
                  onChange={(e) => setOptimizerInputs({ ...optimizerInputs, additionalDetails: e.target.value })}
                  placeholder="e.g., I want more dramatic lighting, focus on the character's emotions, add cinematic depth..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mood/Tone
                  </label>
                  <select
                    value={optimizerInputs.mood}
                    onChange={(e) => setOptimizerInputs({ ...optimizerInputs, mood: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select mood...</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="peaceful">Peaceful</option>
                    <option value="energetic">Energetic</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="joyful">Joyful</option>
                    <option value="tense">Tense</option>
                    <option value="melancholic">Melancholic</option>
                    <option value="epic">Epic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Camera Style
                  </label>
                  <select
                    value={optimizerInputs.cameraStyle}
                    onChange={(e) => setOptimizerInputs({ ...optimizerInputs, cameraStyle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select style...</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="documentary">Documentary</option>
                    <option value="handheld">Handheld</option>
                    <option value="static">Static/Locked</option>
                    <option value="aerial">Aerial/Drone</option>
                    <option value="tracking">Tracking Shot</option>
                    <option value="pov">POV/First Person</option>
                    <option value="slow-motion">Slow Motion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Audio Style
                  </label>
                  <select
                    value={optimizerInputs.audioStyle}
                    onChange={(e) => setOptimizerInputs({ ...optimizerInputs, audioStyle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select audio...</option>
                    <option value="orchestral">Orchestral</option>
                    <option value="ambient">Ambient</option>
                    <option value="electronic">Electronic</option>
                    <option value="acoustic">Acoustic</option>
                    <option value="nature">Nature Sounds</option>
                    <option value="urban">Urban/City</option>
                    <option value="minimal">Minimal</option>
                    <option value="upbeat">Upbeat/Energetic</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={optimizing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  {optimizing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Optimize Prompt
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAIOptimizer(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                <p className="font-medium flex items-center mb-1">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Pro Tip
                </p>
                <p>The AI will enhance your prompt with cinematic details, optimal camera angles, lighting, and audio descriptions to maximize video quality.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Image Preview Modal */}
      {showImageModal && imagePreviewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-bold text-white">Image Preview</h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-white/80 hover:text-white transition-colors"
                title="Close (ESC)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Container */}
            <div className="bg-gray-100 p-6 flex items-center justify-center" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <img
                src={imagePreviewUrl}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">{imageFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {imageFile.size ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                  </p>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default CompactPromptForm;
