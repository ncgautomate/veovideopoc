import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FeatureSidebar from './components/FeatureSidebar';
import CompactPromptForm from './components/CompactPromptForm';
import VideoPlayer from './components/VideoPlayer';
import ProgressIndicator from './components/ProgressIndicator';
import VideoGallery from './components/VideoGallery';
import CommunityLibrary from './components/CommunityLibrary';
import AIChatAssistant from './components/AIChatAssistant';
import StoryComposer from './components/StoryComposer';
import SequenceQueue from './components/SequenceQueue';
import { uploadImage, generateVideo, checkVideoStatus, getVideoUrl } from './services/api';

function App() {
  // State management
  const [view, setView] = useState('studio'); // studio, gallery, library, sequence
  const [selectedFeature, setSelectedFeature] = useState('text-to-video');
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, completed
  const [imageFile, setImageFile] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [promptFromChat, setPromptFromChat] = useState(null);
  const [storyFromChat, setStoryFromChat] = useState(null);

  // Sequence generation state
  const [activeCompositionId, setActiveCompositionId] = useState(null);

  // Handle prompt from AI chat (Studio mode)
  const handleUsePromptFromChat = (promptText) => {
    setPromptFromChat(promptText);
    // Switch to studio view if not already there
    if (view !== 'studio') {
      setView('studio');
    }
  };

  // Handle story from AI chat (Sequence mode)
  const handleUseStoryFromChat = (storyText) => {
    setStoryFromChat(storyText);
    // Switch to sequence view if not already there
    if (view !== 'sequence') {
      setView('sequence');
    }
  };

  // Handle regenerate/remix from gallery
  const handleRegenerate = (videoData) => {
    setPrefillData(videoData);
    setView('studio');
    setSelectedFeature('text-to-video');
    setGenerationStatus('idle');
    setVideoUrl(null);
    setError(null);
  };

  // Handle image upload
  const handleImageUploaded = async (file) => {
    if (!file) {
      // User removed the image
      setImageFile(null);
      setImageId(null);
      setError(null);
      return;
    }

    setImageFile(file);
    setError(null);
    setUploadingImage(true);

    try {
      const result = await uploadImage(file);
      setImageId(result.image_id);
    } catch (err) {
      setError('Failed to upload image: ' + (err.response?.data?.detail || err.message));
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle video generation
  const handleGenerateVideo = async (formData) => {
    setError(null);
    setGenerationStatus('generating');
    setElapsedTime(0);
    setVideoUrl(null);

    try {
      const result = await generateVideo({
        ...formData,
        image_id: imageId,
      });
      setOperationId(result.operation_id);
    } catch (err) {
      setError('Failed to start video generation: ' + (err.response?.data?.detail || err.message));
      setGenerationStatus('idle');
    }
  };

  // Poll for video status
  useEffect(() => {
    if (generationStatus !== 'generating' || !operationId) return;

    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        setElapsedTime((Date.now() - startTime) / 1000);

        const status = await checkVideoStatus(operationId);

        if (status.done) {
          clearInterval(interval);
          if (status.video_url) {
            setVideoUrl(getVideoUrl(status.video_url));
            setGenerationStatus('completed');
          } else if (status.error) {
            setError('Video generation failed: ' + status.error);
            setGenerationStatus('idle');
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError('Error checking status: ' + (err.response?.data?.detail || err.message));
        setGenerationStatus('idle');
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [generationStatus, operationId]);

  // Reset for new generation
  const handleGenerateAnother = () => {
    setGenerationStatus('idle');
    setImageFile(null);
    setImageId(null);
    setOperationId(null);
    setVideoUrl(null);
    setError(null);
    setElapsedTime(0);
    setPrefillData(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Top Navbar */}
      <Navbar currentView={view} onViewChange={setView} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pt-16 animate-fadeIn">
        {/* Studio View with Sidebar */}
        {view === 'studio' && (
          <>
            {/* Feature Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <FeatureSidebar selectedFeature={selectedFeature} onFeatureSelect={setSelectedFeature} />
            </div>

            {/* Studio Content - Split Screen */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Form */}
              <div className="w-full lg:w-2/5 xl:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4 lg:p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Video Studio
                    </h2>
                    <p className="text-sm text-gray-600 mt-1.5">Transform your prompts into stunning videos</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start shadow-soft animate-fadeIn">
                      <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-sm mb-0.5">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Compact Form */}
                  <CompactPromptForm
                    onSubmit={handleGenerateVideo}
                    loading={generationStatus === 'generating'}
                    initialData={prefillData}
                    onDataUsed={() => setPrefillData(null)}
                    onImageUploaded={handleImageUploaded}
                    imageFile={imageFile}
                    uploadingImage={uploadingImage}
                    promptFromChat={promptFromChat}
                    onChatPromptUsed={() => setPromptFromChat(null)}
                  />
                </div>
              </div>

              {/* Right Panel - Output */}
              <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-8 overflow-y-auto">
                {generationStatus === 'idle' && !videoUrl && (
                  <div className="text-center animate-fadeIn">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Preview</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Your generated video will appear here
                    </p>
                  </div>
                )}

                {generationStatus === 'generating' && (
                  <div className="w-full max-w-2xl">
                    <ProgressIndicator
                      status="Generating your video with AI..."
                      elapsed={elapsedTime}
                    />
                  </div>
                )}

                {generationStatus === 'completed' && videoUrl && (
                  <div className="w-full max-w-4xl animate-fadeIn">
                    <div className="mb-6 flex items-center justify-between px-2">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Video Ready!
                      </h3>
                      <button
                        onClick={handleGenerateAnother}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-medium hover:shadow-large transition-smooth transform hover:scale-105"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        New Video
                      </button>
                    </div>
                    <VideoPlayer
                      videoUrl={videoUrl}
                      onGenerateAnother={handleGenerateAnother}
                      hideButton={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Gallery View */}
        {view === 'gallery' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
              <VideoGallery onRegenerate={handleRegenerate} />
            </div>
          </div>
        )}

        {/* Library View */}
        {view === 'library' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
              <CommunityLibrary onRemix={handleRegenerate} />
            </div>
          </div>
        )}

        {/* Sequence View - 60-Second Video Creator */}
        {view === 'sequence' && (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
              {!activeCompositionId ? (
                <StoryComposer
                  onSequenceStarted={setActiveCompositionId}
                  storyFromChat={storyFromChat}
                  onChatStoryUsed={() => setStoryFromChat(null)}
                />
              ) : (
                <SequenceQueue
                  compositionId={activeCompositionId}
                  onBackToComposer={() => setActiveCompositionId(null)}
                  onRetry={(newCompositionId) => setActiveCompositionId(newCompositionId)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-3 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <p className="text-gray-600 font-medium">
            © 2025 CleverCreator.ai |
            <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Powered by Veo 3.1
            </span>
          </p>
          <p className="hidden sm:block text-gray-500 font-medium">
            Native Audio • 720p/1080p • 4-8s • Multiple Ratios
          </p>
        </div>
      </div>

      {/* AI Chat Assistant - Floating */}
      <AIChatAssistant
        currentView={view}
        onUsePrompt={handleUsePromptFromChat}
        onUseStory={handleUseStoryFromChat}
      />
    </div>
  );
}

export default App;
