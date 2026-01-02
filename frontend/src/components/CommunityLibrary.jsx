import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const CommunityLibrary = ({ onRemix }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchPublicVideos();
  }, []);

  const fetchPublicVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/library`);
      setVideos(response.data.videos || []);
      setError(null);
    } catch (err) {
      setError('Failed to load public videos: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading community library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Public Videos Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Be the first to share your creations with the community! Create a video and make it public to appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Library ({videos.length})</h2>
          <p className="text-sm text-gray-600 mt-1">Discover and remix prompts from the community</p>
        </div>
        <button
          onClick={fetchPublicVideos}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Pinterest-style Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer mb-4 break-inside-avoid inline-block w-full"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video bg-gray-900 relative group">
              <video
                src={`${API_URL}/api/videos/${video.id}`}
                className="w-full h-full object-cover"
                muted
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                <svg className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-all" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Public Badge */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Public
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">{formatDate(video.created_at)}</p>
              {video.prompt && (
                <div className="mb-3 p-3 bg-gray-50 rounded text-xs">
                  <p className="text-gray-700 line-clamp-3 mb-2" title={video.prompt}>
                    <strong>Prompt:</strong> {video.prompt}
                  </p>
                  {video.resolution && (
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {video.resolution}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800">
                        {video.duration}s
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {video.aspect_ratio}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemix({
                      prompt: video.prompt,
                      negative_prompt: video.negative_prompt || '',
                      resolution: video.resolution || '720p',
                      duration: video.duration || 8,
                      aspect_ratio: video.aspect_ratio || '16:9'
                    });
                  }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                  Remix This Prompt
                </button>
                <a
                  href={`${API_URL}/api/videos/${video.id}`}
                  download={`community_video_${video.id}.mp4`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 transition-all"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-medium mr-3">Video Player</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Public
                </span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-black">
              <video
                src={`${API_URL}/api/videos/${selectedVideo.id}`}
                controls
                autoPlay
                className="w-full"
              />
            </div>
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Created: {formatDate(selectedVideo.created_at)}</p>
                <p className="text-sm text-gray-600">Size: {formatFileSize(selectedVideo.size)}</p>
              </div>
              {selectedVideo.prompt && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Prompt:</p>
                  <p className="text-sm text-gray-700 mb-3">{selectedVideo.prompt}</p>
                  {selectedVideo.negative_prompt && (
                    <>
                      <p className="text-sm font-medium text-gray-900 mt-2 mb-1">Negative Prompt:</p>
                      <p className="text-sm text-gray-700 mb-3">{selectedVideo.negative_prompt}</p>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      {selectedVideo.resolution}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-green-100 text-green-800 font-medium">
                      {selectedVideo.duration}s
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                      {selectedVideo.aspect_ratio}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemix({
                    prompt: selectedVideo.prompt,
                    negative_prompt: selectedVideo.negative_prompt || '',
                    resolution: selectedVideo.resolution || '720p',
                    duration: selectedVideo.duration || 8,
                    aspect_ratio: selectedVideo.aspect_ratio || '16:9'
                  });
                  setSelectedVideo(null);
                }}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                Remix This Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLibrary;
