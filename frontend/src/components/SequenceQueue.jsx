import { useState, useEffect } from 'react';
import { Film, Download, CheckCircle, Loader, AlertCircle, Play, Scissors, RefreshCw } from 'lucide-react';

const SequenceQueue = ({ compositionId, onBackToComposer, onRetry }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

  useEffect(() => {
    if (!compositionId) return;

    // Fetch status immediately
    fetchStatus();

    // Then poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, [compositionId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/sequence/status/${compositionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch composition status');
      }

      const data = await response.json();
      setStatus(data);
      setLoading(false);

      // Stop polling if completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        // Keep polling for a bit to show final state
      }

    } catch (err) {
      console.error('Status fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!status || !status.scenes) {
      setError('Cannot retry: Original scene data not available');
      return;
    }

    setRetrying(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/sequence/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: status.scenes,
          resolution: status.resolution || '720p',
          aspect_ratio: status.aspect_ratio || '16:9'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retry composition');
      }

      const data = await response.json();

      // Notify parent component with new composition ID
      if (onRetry) {
        onRetry(data.composition_id);
      }

    } catch (err) {
      console.error('Retry error:', err);
      setError(`Retry failed: ${err.message}`);
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const totalSegments = status.total_segments || 8;
    const badges = {
      pending: { text: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Loader },
      generating: { text: `Generating ${status.current_segment}/${totalSegments}`, color: 'bg-blue-100 text-blue-700', icon: Film },
      stitching: { text: 'Stitching Segments', color: 'bg-purple-100 text-purple-700', icon: Scissors },
      completed: { text: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      failed: { text: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
    };

    const badge = badges[status.status] || badges.pending;
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${badge.color} font-semibold`}>
        <Icon className="w-4 h-4" />
        <span>{badge.text}</span>
      </div>
    );
  };

  const getSegmentStatusIcon = (segment) => {
    if (segment.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (segment.status === 'processing') {
      return <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>;
    } else if (segment.status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  const calculateProgress = () => {
    if (!status) return 0;
    if (status.status === 'completed') return 100;
    if (status.status === 'stitching') return 95;

    // Calculate based on completed segments
    const totalSegments = status.total_segments || 8;
    const completedSegments = status.segments.filter(s => s.status === 'completed').length;
    return Math.round((completedSegments / totalSegments) * 90); // Max 90% before stitching
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading composition status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 text-center mb-2">Error Loading Status</h2>
          <p className="text-red-700 text-center mb-4">{error}</p>
          <button
            onClick={onBackToComposer}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Composer
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600">No composition found</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {status?.total_segments ? `${status.total_segments * 8}-Second` : ''} Video Generation
            </h1>
            <p className="text-gray-600">Composition ID: {compositionId.substring(0, 8)}...</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-right">{progress}% Complete</p>
      </div>

      {/* Error Message */}
      {status.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700">{status.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Segment Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Segments Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {status.segments.map((segment) => (
            <div
              key={segment.scene_number}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                segment.status === 'completed'
                  ? 'border-green-200 shadow-md'
                  : segment.status === 'processing'
                  ? 'border-purple-300 shadow-lg animate-pulse'
                  : segment.status === 'failed'
                  ? 'border-red-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">Scene {segment.scene_number}</span>
                {getSegmentStatusIcon(segment)}
              </div>

              {/* Video Preview for Completed Segments */}
              {segment.status === 'completed' && segment.video_id && (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                  <video
                    src={`${backendUrl}/api/videos/${segment.video_id}`}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded">
                    8s
                  </div>
                </div>
              )}

              {/* Status Text */}
              {segment.status !== 'completed' && (
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 capitalize">{segment.status}</p>
                </div>
              )}

              {/* Error for Failed Segments */}
              {segment.error && (
                <p className="text-xs text-red-600 mt-2">{segment.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final Video Player */}
      {status.status === 'completed' && status.final_video_url && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Final Video Ready!</h2>
          </div>

          <div className="bg-black rounded-xl overflow-hidden mb-4 shadow-2xl">
            <video
              src={`${backendUrl}${status.final_video_url}`}
              controls
              autoPlay
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`${backendUrl}${status.final_video_url}`}
              download={`composition_${compositionId}.mp4`}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download 60-Second Video</span>
            </a>

            <button
              onClick={onBackToComposer}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Create Another
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{status.total_segments}</p>
              <p className="text-xs text-gray-600">Segments</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">~{status.total_segments * 8}s</p>
              <p className="text-xs text-gray-600">Duration</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {status.completed_at && status.created_at
                  ? Math.round((status.completed_at - status.created_at) / 60)
                  : '-'}
              </p>
              <p className="text-xs text-gray-600">Minutes</p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Status Message */}
      {status.status === 'failed' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">Generation Failed</h3>
              <p className="text-sm text-red-700 mb-3">
                {status.error || 'One or more segments failed to generate after multiple retries.'}
              </p>

              {/* Show which segment failed */}
              {status.segments && (
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Failed Segments:</p>
                  {status.segments.map((seg, idx) =>
                    seg.status === 'failed' ? (
                      <div key={idx} className="text-xs text-red-600 mb-1">
                        • Scene {seg.scene_number}: {seg.error || 'Generation failed'}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                  <span>{retrying ? 'Retrying...' : 'Retry Generation'}</span>
                </button>

                <button
                  onClick={onBackToComposer}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Edit Story
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                💡 Tip: The retry will use the same scenes and settings. If it fails again, try editing your story or simplifying the prompts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In Progress Message */}
      {(status.status === 'generating' || status.status === 'stitching' || status.status === 'pending') && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Loader className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900 mb-2">
                {status.status === 'stitching'
                  ? 'Stitching all segments together...'
                  : `Generating segment ${status.current_segment} of ${status.total_segments}...`}
              </p>
              <p className="text-sm text-blue-700 mb-2">
                This process takes time. You can safely close this page and come back later.
              </p>
              <p className="text-xs text-blue-600">
                Estimated completion: {status.status === 'stitching' ? '2-5 minutes' : `${(status.total_segments - status.current_segment) * 5}-${(status.total_segments - status.current_segment) * 10} minutes`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceQueue;
