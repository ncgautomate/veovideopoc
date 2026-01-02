import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const VideoGallery = ({ onRegenerate }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/videos`);
      setVideos(response.data.videos || []);
      setError(null);
    } catch (err) {
      setError('Failed to load videos: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await axios.delete(`${API_URL}/api/videos/${videoId}`);
      setVideos(videos.filter(v => v.id !== videoId));
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
    } catch (err) {
      alert('Failed to delete video: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleVisibility = async (videoId, currentVisibility) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/videos/${videoId}/visibility?is_public=${!currentVisibility}`
      );

      // Update local state
      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, is_public: !currentVisibility } : v
      ));

      if (selectedVideo?.id === videoId) {
        setSelectedVideo({ ...selectedVideo, is_public: !currentVisibility });
      }
    } catch (err) {
      alert('Failed to toggle visibility: ' + (err.response?.data?.detail || err.message));
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
        <p className="mt-4 text-gray-600">Loading videos...</p>
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
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
        <p className="text-gray-600">Create your first video to see it here!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Videos ({videos.length})</h2>
        <button
          onClick={fetchVideos}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

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
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">{formatDate(video.created_at)}</p>
              <p className="text-xs text-gray-500 mb-2">{formatFileSize(video.size)}</p>
              {video.prompt && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <p className="text-gray-700 line-clamp-2" title={video.prompt}>
                    <strong>Prompt:</strong> {video.prompt}
                  </p>
                  {video.resolution && (
                    <p className="text-gray-600 mt-1">
                      {video.resolution} • {video.duration}s • {video.aspect_ratio}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <a
                    href={`${API_URL}/api/videos/${video.id}`}
                    download={`video_${video.id}.mp4`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-all"
                  >
                    Download
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video.id);
                    }}
                    className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(video.id, video.is_public);
                  }}
                  className={`w-full px-3 py-2 ${
                    video.is_public
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white text-xs font-medium rounded transition-all flex items-center justify-center`}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    {video.is_public ? (
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    ) : (
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    )}
                    {video.is_public && (
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    )}
                  </svg>
                  {video.is_public ? 'Public - Make Private' : 'Private - Make Public'}
                </button>
                {video.prompt && onRegenerate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerate({
                        prompt: video.prompt,
                        negative_prompt: video.negative_prompt || '',
                        resolution: video.resolution || '720p',
                        duration: video.duration || 8,
                        aspect_ratio: video.aspect_ratio || '16:9'
                      });
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-all flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                )}
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
              <h3 className="text-lg font-medium">Video Player</h3>
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
              <p className="text-sm text-gray-600">Created: {formatDate(selectedVideo.created_at)}</p>
              <p className="text-sm text-gray-600">Size: {formatFileSize(selectedVideo.size)}</p>
              {selectedVideo.prompt && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Prompt:</p>
                  <p className="text-sm text-gray-700">{selectedVideo.prompt}</p>
                  {selectedVideo.negative_prompt && (
                    <>
                      <p className="text-sm font-medium text-gray-900 mt-2 mb-1">Negative Prompt:</p>
                      <p className="text-sm text-gray-700">{selectedVideo.negative_prompt}</p>
                    </>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedVideo.resolution} • {selectedVideo.duration}s • {selectedVideo.aspect_ratio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
