import { useState, useEffect } from 'react';
import { Sparkles, Film, Edit3, Play, AlertCircle } from 'lucide-react';

const StoryComposer = ({ onSequenceStarted, storyFromChat, onChatStoryUsed }) => {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [sceneCount, setSceneCount] = useState(4);
  const [duration, setDuration] = useState(8);
  const [analyzingStory, setAnalyzingStory] = useState(false);
  const [optimizingPrompt, setOptimizingPrompt] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewScene, setPreviewScene] = useState(null);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [defaultCamera, setDefaultCamera] = useState('');
  const [defaultStyle, setDefaultStyle] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

  // Handle story from AI chat assistant
  useEffect(() => {
    if (storyFromChat) {
      setStoryPrompt(storyFromChat);
      setShowSceneEditor(false); // Reset to story input view
      setScenes([]); // Clear any existing scenes
      if (onChatStoryUsed) {
        onChatStoryUsed();
      }
    }
  }, [storyFromChat, onChatStoryUsed]);

  const handleOptimizePrompt = async () => {
    if (!storyPrompt.trim() || storyPrompt.length < 20) {
      setError('Please enter a story description (at least 20 characters) before optimizing');
      return;
    }

    setError(null);
    setOptimizingPrompt(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Enhance this story idea into a detailed narrative for AI video generation: "${storyPrompt}"

CRITICAL INSTRUCTIONS:
- Write ONLY the enhanced story description - NO introductions, NO labels, NO explanations
- DO NOT use markers like "Prompt:", "Action:", "Enhancements:", "Character Names:", etc.
- DO NOT include ANY metadata or formatting artifacts
- Just write the pure story as a cohesive narrative paragraph

Include these details naturally in the story:
- Specific character details (appearance, clothing, age, personality)
- Rich setting descriptions (location, time of day, weather, lighting, atmosphere)
- Clear narrative arc with beginning, middle, and end
- Cinematic visual details (camera angles, movements, color tones)
- Emotional beats and character motivations

Keep it under 500 words, suitable for ${sceneCount} sequential ${aspectRatio === '16:9' ? 'landscape' : 'portrait'} video scenes.

OUTPUT ONLY THE CLEAN STORY TEXT - START WRITING IMMEDIATELY:`,
          conversation_history: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize prompt');
      }

      const data = await response.json();

      // Clean up AI response - remove common artifacts
      let cleanedStory = data.response
        .replace(/\*\*Prompt:\*\*/gi, '')
        .replace(/\*\*Action:\*\*/gi, '')
        .replace(/\*\*Enhancements:\*\*/gi, '')
        .replace(/\*\*Character Names:\*\*/gi, '')
        .replace(/\*\*Scene:\*\*/gi, '')
        .replace(/\*\*Story:\*\*/gi, '')
        .replace(/\*\*Enhanced Story:\*\*/gi, '')
        .replace(/\*\*Description:\*\*/gi, '')
        .replace(/Here's the enhanced story:/gi, '')
        .replace(/Here is the enhanced story:/gi, '')
        .replace(/Enhanced version:/gi, '')
        .replace(/^[•\-*]\s+/gm, '') // Remove bullet points at start of lines
        .trim();

      setStoryPrompt(cleanedStory);

    } catch (err) {
      console.error('Prompt optimization error:', err);
      setError('Failed to optimize prompt. Please try again.');
    } finally {
      setOptimizingPrompt(false);
    }
  };

  const handleAnalyzeStory = async () => {
    if (!storyPrompt.trim() || storyPrompt.length < 20) {
      setError('Please enter a story description (at least 20 characters)');
      return;
    }

    setError(null);
    setAnalyzingStory(true);

    try {
      const response = await fetch(`${backendUrl}/api/sequence/analyze-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_prompt: storyPrompt,
          aspect_ratio: aspectRatio,
          scene_count: sceneCount,
          duration: duration,
          default_camera_style: defaultCamera || null,
          default_style_control: defaultStyle || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze story');
      }

      const data = await response.json();
      setScenes(data.scenes);
      setShowSceneEditor(true);

    } catch (err) {
      console.error('Story analysis error:', err);
      setError(err.message || 'Failed to analyze story. Please try again.');
    } finally {
      setAnalyzingStory(false);
    }
  };

  const handleSubmitSequence = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${backendUrl}/api/sequence/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes,
          resolution: resolution,
          aspect_ratio: aspectRatio,
          duration: duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start sequence generation');
      }

      const data = await response.json();
      onSequenceStarted(data.composition_id);

    } catch (err) {
      console.error('Sequence submission error:', err);
      setError(err.message || 'Failed to start generation. Please try again.');
      setSubmitting(false);
    }
  };

  const updateScenePrompt = (index, newPrompt) => {
    const updatedScenes = [...scenes];
    updatedScenes[index].prompt = newPrompt;
    setScenes(updatedScenes);
  };

  const updateSceneCameraStyle = (index, cameraStyle) => {
    const updatedScenes = [...scenes];
    updatedScenes[index].camera_style = cameraStyle;
    setScenes(updatedScenes);
  };

  const updateSceneStyleControl = (index, styleControl) => {
    const updatedScenes = [...scenes];
    updatedScenes[index].style_control = styleControl;
    setScenes(updatedScenes);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center space-x-2 mb-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-md">
            <Film className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sequential Video Story Creator
          </h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl mx-auto">
          Create multi-scene videos (4-8s each) with AI-powered character consistency and smooth transitions.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Story Input */}
      {!showSceneEditor && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
              1
            </div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Describe Your Story</span>
            </h2>
          </div>

          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="Example: A day in the life of a friendly robot exploring a vibrant futuristic city, discovering friendship and wonder at every corner...&#10;&#10;Or try something simple to get started, then use 'Enhance Story with AI' to add details!"
            className="w-full h-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-gray-900 placeholder:text-gray-400"
            maxLength={8192}
          />

          <div className="flex items-center justify-between mt-2 mb-2">
            <p className="text-xs text-gray-500">
              {storyPrompt.length} / 8192 characters
            </p>
            <p className="text-xs text-gray-500">
              Minimum: 20 characters
            </p>
          </div>

          {/* Optimize Prompt Button */}
          <div className="relative group mb-4">
            <button
              onClick={handleOptimizePrompt}
              disabled={optimizingPrompt || storyPrompt.length < 20}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {optimizingPrompt ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Optimizing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Enhance Story with AI</span>
                </>
              )}
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              <p className="font-semibold mb-1">💡 AI Story Enhancement</p>
              <p>Automatically adds rich details to your story including character descriptions, vivid settings, cinematic camera angles, and emotional beats - perfect for creating professional video sequences!</p>
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Scene Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <span>Scenes</span>
                <div className="relative group">
                  <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Number of scenes in your story. More scenes = longer video.
                  </div>
                </div>
              </label>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value={4}>4 scenes</option>
                <option value={5}>5 scenes</option>
                <option value={6}>6 scenes</option>
                <option value={7}>7 scenes</option>
                <option value={8}>8 scenes</option>
              </select>
            </div>

            {/* Duration per Scene */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Duration/Scene</span>
                <div className="relative group">
                  <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Duration of each individual scene. Total = Scenes × Duration/Scene.
                  </div>
                </div>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value={4}>4 seconds</option>
                <option value={6}>6 seconds</option>
                <option value={8}>8 seconds</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>Aspect Ratio</span>
                <div className="relative group">
                  <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    16:9 for desktop/YouTube, 9:16 for mobile/TikTok/Reels
                  </div>
                </div>
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Resolution</span>
                <div className="relative group">
                  <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Higher resolution = better quality but longer generation time
                  </div>
                </div>
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
              </select>
            </div>
          </div>

          {/* Optional Default Camera & Style Controls */}
          <details className="group mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <summary className="cursor-pointer text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>🎬 Default Camera & Style (Optional)</span>
              </div>
              <div className="relative group/tooltip">
                <svg className="w-4 h-4 text-purple-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                  Set default camera movement and visual style for all scenes. Leave empty for AI to intelligently choose based on your story. You can override per scene in Step 2.
                </div>
              </div>
            </summary>

            <div className="mt-3 grid grid-cols-2 gap-4">
              {/* Default Camera Movement */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>📹</span>
                  <span>Default Camera</span>
                </label>
                <select
                  value={defaultCamera}
                  onChange={(e) => setDefaultCamera(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer text-sm"
                >
                  <option value="">AI Smart Default</option>
                  <option value="static">Static/Fixed</option>
                  <option value="pan left">Pan Left</option>
                  <option value="pan right">Pan Right</option>
                  <option value="tilt up">Tilt Up</option>
                  <option value="tilt down">Tilt Down</option>
                  <option value="zoom in">Zoom In</option>
                  <option value="zoom out">Zoom Out</option>
                  <option value="dolly in">Dolly In</option>
                  <option value="dolly out">Dolly Out</option>
                  <option value="tracking shot">Tracking Shot</option>
                  <option value="crane up">Crane Up</option>
                  <option value="crane down">Crane Down</option>
                  <option value="aerial view">Aerial View</option>
                  <option value="handheld">Handheld</option>
                  <option value="steadicam">Steadicam</option>
                  <option value="orbit">Orbit/Circular</option>
                </select>
              </div>

              {/* Default Visual Style */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>🎨</span>
                  <span>Default Visual Style</span>
                </label>
                <select
                  value={defaultStyle}
                  onChange={(e) => setDefaultStyle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer text-sm"
                >
                  <option value="">AI Smart Default</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="documentary">Documentary</option>
                  <option value="vintage">Vintage/Retro</option>
                  <option value="film noir">Film Noir</option>
                  <option value="black and white">Black & White</option>
                  <option value="high contrast">High Contrast</option>
                  <option value="soft dreamy">Soft/Dreamy</option>
                  <option value="vibrant saturated">Vibrant/Saturated</option>
                  <option value="muted colors">Muted Colors</option>
                  <option value="moody dark">Moody/Dark</option>
                  <option value="warm tones">Warm Tones</option>
                  <option value="cool tones">Cool Tones</option>
                  <option value="golden hour">Golden Hour</option>
                  <option value="blue hour">Blue Hour</option>
                  <option value="neon lights">Neon Lights</option>
                </select>
              </div>
            </div>

            <p className="mt-2 text-xs text-purple-700 italic">
              💡 {defaultCamera || defaultStyle ? 'These defaults will be applied to all scenes. You can customize individual scenes in Step 2.' : 'Leave empty for AI to intelligently choose camera angles and styles based on your story content.'}
            </p>
          </details>

          {/* Generate Button */}
          <button
            onClick={handleAnalyzeStory}
            disabled={analyzingStory || storyPrompt.length < 20}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            {analyzingStory ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Story...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate {sceneCount} Scenes with AI</span>
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Pro Tips:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use the "Enhance Story with AI" button to add rich details automatically</li>
                  <li>• Include specific character descriptions and vivid settings</li>
                  <li>• AI will break your story into {sceneCount} sequential {duration}-second scenes (~{sceneCount * duration}s total)</li>
                  <li>• Each scene builds on the previous one for seamless continuity</li>
                  <li>• Adjust duration per scene to control pacing (4s = fast, 8s = slow)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">📋 What's Next? (Step 2)</p>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• <strong>Review & Edit:</strong> AI-generated scene descriptions for each {duration}s segment</li>
                  <li>• <strong>Customize Scenes:</strong> {defaultCamera || defaultStyle ? 'Review and adjust default camera/style settings per scene if needed' : 'Add camera angles and visual styles (AI will suggest smart defaults)'}</li>
                  <li>• <strong>Total Duration:</strong> See your final video length ({sceneCount} × {duration}s = ~{sceneCount * duration}s)</li>
                  <li>• <strong>Start Generation:</strong> Submit all scenes for sequential video creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Scene Editor */}
      {showSceneEditor && (
        <div className="space-y-4">
          {/* Header with Navigation */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Review & Edit Scenes</h2>
                  <p className="text-xs text-gray-500">{scenes.length} scenes • ~{scenes.reduce((total, scene) => total + scene.duration, 0)}s total</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setShowSceneEditor(false);
                  }}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowSceneEditor(false);
                    setScenes([]);
                    setStoryPrompt('');
                  }}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Start Over</span>
                </button>
              </div>
            </div>

            {/* Quick Scene Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs font-medium text-gray-600 mr-2 whitespace-nowrap">Jump to:</span>
              {scenes.map((scene) => (
                <button
                  key={scene.scene_number}
                  onClick={() => {
                    document.getElementById(`scene-${scene.scene_number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="flex-shrink-0 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs font-semibold transition-colors"
                >
                  {scene.scene_number}
                </button>
              ))}
            </div>
          </div>

          {/* Scene Cards Grid - 2 columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {scenes.map((scene, index) => (
              <div
                key={scene.scene_number}
                id={`scene-${scene.scene_number}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {scene.scene_number}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Scene {scene.scene_number}</h3>
                      <p className="text-xs text-gray-500">{scene.duration}s • {scene.prompt.length} chars</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewScene(scene)}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Preview scene"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview</span>
                  </button>
                </div>

                {/* Scene Prompt */}
                <div className="mb-2">
                  <textarea
                    value={scene.prompt}
                    onChange={(e) => updateScenePrompt(index, e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y text-xs leading-relaxed min-h-[60px] max-h-[300px]"
                    rows="3"
                    maxLength={4096}
                    placeholder="Scene description..."
                  />
                </div>

                {/* Optional Controls Section - Auto-expanded */}
                <details className="group mt-1" open>
                  <summary className="cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-between py-1 px-1 hover:bg-purple-50 rounded">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Camera & Style</span>
                    </div>
                    {(scene.camera_style || scene.style_control) && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        ✓ Set
                      </span>
                    )}
                  </summary>

                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {/* Camera Movement Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-0.5">📹 Camera</label>
                      <select
                        value={scene.camera_style || ''}
                        onChange={(e) => updateSceneCameraStyle(index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-white"
                      >
                        <option value="">None</option>
                        <option value="static">Static/Fixed</option>
                        <option value="pan left">Pan Left</option>
                        <option value="pan right">Pan Right</option>
                        <option value="tilt up">Tilt Up</option>
                        <option value="tilt down">Tilt Down</option>
                        <option value="zoom in">Zoom In</option>
                        <option value="zoom out">Zoom Out</option>
                        <option value="dolly in">Dolly In</option>
                        <option value="dolly out">Dolly Out</option>
                        <option value="tracking shot">Tracking Shot</option>
                        <option value="crane up">Crane Up</option>
                        <option value="crane down">Crane Down</option>
                        <option value="aerial view">Aerial View</option>
                        <option value="handheld">Handheld</option>
                        <option value="steadicam">Steadicam</option>
                        <option value="orbit">Orbit/Circular</option>
                      </select>
                    </div>

                    {/* Visual Style Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-0.5">🎨 Style</label>
                      <select
                        value={scene.style_control || ''}
                        onChange={(e) => updateSceneStyleControl(index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-white"
                      >
                        <option value="">None</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="documentary">Documentary</option>
                        <option value="vintage">Vintage/Retro</option>
                        <option value="film noir">Film Noir</option>
                        <option value="black and white">Black & White</option>
                        <option value="high contrast">High Contrast</option>
                        <option value="soft dreamy">Soft/Dreamy</option>
                        <option value="vibrant saturated">Vibrant/Saturated</option>
                        <option value="muted colors">Muted Colors</option>
                        <option value="moody dark">Moody/Dark</option>
                        <option value="warm tones">Warm Tones</option>
                        <option value="cool tones">Cool Tones</option>
                        <option value="golden hour">Golden Hour</option>
                        <option value="blue hour">Blue Hour</option>
                        <option value="neon lights">Neon Lights</option>
                      </select>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {/* Submit Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">Ready to Generate</p>
                  <p className="text-xs text-green-700">{scenes.length} scenes • ~{scenes.reduce((total, scene) => total + scene.duration, 0)}s total • Est. {scenes.length * 5}-{scenes.length * 10} min</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">~{scenes.reduce((total, scene) => total + scene.duration, 0)}s</p>
                <p className="text-xs text-green-700">Video length</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Preview All Scenes Button */}
              <button
                onClick={() => setShowAllPreview(true)}
                className="py-3 bg-white border-2 border-green-600 text-green-700 font-bold rounded-lg shadow-sm hover:bg-green-50 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview All Scenes</span>
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmitSequence}
                disabled={submitting}
                className="py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Generating</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Scene Preview Modal */}
      {previewScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewScene(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center font-bold">
                  {previewScene.scene_number}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Scene {previewScene.scene_number} Preview</h3>
                  <p className="text-sm text-purple-100">{previewScene.duration}s duration • {previewScene.prompt.length} characters</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewScene(null)}
                className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Scene Prompt */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Scene Description</span>
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{previewScene.prompt}</p>
                </div>
              </div>

              {/* Scene Settings Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Duration */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-bold text-blue-900">Duration</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{previewScene.duration}s</p>
                </div>

                {/* Camera Style */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">📹</span>
                    <span className="text-xs font-bold text-purple-900">Camera</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-700">
                    {previewScene.camera_style || <span className="text-gray-400 italic">None</span>}
                  </p>
                </div>

                {/* Visual Style */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">🎨</span>
                    <span className="text-xs font-bold text-pink-900">Style</span>
                  </div>
                  <p className="text-sm font-semibold text-pink-700">
                    {previewScene.style_control || <span className="text-gray-400 italic">None</span>}
                  </p>
                </div>
              </div>

              {/* Full Video Generation Prompt Preview */}
              {(previewScene.camera_style || previewScene.style_control) && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Complete Prompt with Controls</span>
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {previewScene.camera_style && <><strong className="text-green-700">Camera:</strong> {previewScene.camera_style}. </>}
                      {previewScene.style_control && <><strong className="text-green-700">Style:</strong> {previewScene.style_control}. </>}
                      {previewScene.prompt}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setPreviewScene(null)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Story Preview Modal */}
      {showAllPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAllPreview(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Complete Story Preview</h3>
                  <p className="text-sm text-green-100">{scenes.length} scenes • ~{scenes.reduce((total, scene) => total + scene.duration, 0)}s total duration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllPreview(false)}
                className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Total Scenes</p>
                  <p className="text-2xl font-bold text-blue-900">{scenes.length}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Total Duration</p>
                  <p className="text-2xl font-bold text-purple-900">~{scenes.reduce((total, scene) => total + scene.duration, 0)}s</p>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-pink-700 mb-1">Camera Shots</p>
                  <p className="text-2xl font-bold text-pink-900">{scenes.filter(s => s.camera_style).length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-green-700 mb-1">Styled Scenes</p>
                  <p className="text-2xl font-bold text-green-900">{scenes.filter(s => s.style_control).length}</p>
                </div>
              </div>

              {/* All Scenes */}
              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <div key={scene.scene_number} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    {/* Scene Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {scene.scene_number}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Scene {scene.scene_number}</h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span className="flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{scene.duration}s</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAllPreview(false);
                          setPreviewScene(scene);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Scene Prompt */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Scene Description</label>
                      <p className="text-sm text-gray-800 leading-relaxed bg-white border border-gray-200 rounded p-3">
                        {scene.prompt}
                      </p>
                    </div>

                    {/* Camera & Style Controls */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Camera Movement Dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">📹 Camera Movement</label>
                        <select
                          value={scene.camera_style || ''}
                          onChange={(e) => updateSceneCameraStyle(index, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-white"
                        >
                          <option value="">None</option>
                          <option value="static">Static/Fixed</option>
                          <option value="pan left">Pan Left</option>
                          <option value="pan right">Pan Right</option>
                          <option value="tilt up">Tilt Up</option>
                          <option value="tilt down">Tilt Down</option>
                          <option value="zoom in">Zoom In</option>
                          <option value="zoom out">Zoom Out</option>
                          <option value="dolly in">Dolly In</option>
                          <option value="dolly out">Dolly Out</option>
                          <option value="tracking shot">Tracking Shot</option>
                          <option value="crane up">Crane Up</option>
                          <option value="crane down">Crane Down</option>
                          <option value="aerial view">Aerial View</option>
                          <option value="handheld">Handheld</option>
                          <option value="steadicam">Steadicam</option>
                          <option value="orbit">Orbit/Circular</option>
                        </select>
                      </div>

                      {/* Visual Style Dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">🎨 Visual Style</label>
                        <select
                          value={scene.style_control || ''}
                          onChange={(e) => updateSceneStyleControl(index, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-white"
                        >
                          <option value="">None</option>
                          <option value="cinematic">Cinematic</option>
                          <option value="documentary">Documentary</option>
                          <option value="vintage">Vintage/Retro</option>
                          <option value="film noir">Film Noir</option>
                          <option value="black and white">Black & White</option>
                          <option value="high contrast">High Contrast</option>
                          <option value="soft dreamy">Soft/Dreamy</option>
                          <option value="vibrant saturated">Vibrant/Saturated</option>
                          <option value="muted colors">Muted Colors</option>
                          <option value="moody dark">Moody/Dark</option>
                          <option value="warm tones">Warm Tones</option>
                          <option value="cool tones">Cool Tones</option>
                          <option value="golden hour">Golden Hour</option>
                          <option value="blue hour">Blue Hour</option>
                          <option value="neon lights">Neon Lights</option>
                        </select>
                      </div>
                    </div>

                    {/* Timeline indicator */}
                    {index < scenes.length - 1 && (
                      <div className="flex items-center justify-center mt-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <strong>{scenes.length} scenes</strong> ready for generation • Estimated time: <strong>{scenes.length * 5}-{scenes.length * 10} min</strong>
              </p>
              <button
                onClick={() => setShowAllPreview(false)}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryComposer;
