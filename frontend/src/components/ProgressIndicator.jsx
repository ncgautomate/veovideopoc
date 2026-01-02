import React from 'react';

const ProgressIndicator = ({ status, elapsed }) => {
  // Calculate progress percentage (rough estimate based on average processing time)
  const getProgressPercentage = () => {
    if (!elapsed) return 10;

    // Assuming average processing time of 90 seconds
    const averageTime = 90;
    const percentage = Math.min((elapsed / averageTime) * 100, 95);
    return percentage;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="text-center py-12 space-y-6">
      {/* Animated Spinner */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">
          Generating Your Video...
        </h3>
        <p className="text-sm font-medium text-blue-600">{status}</p>
        {elapsed && (
          <p className="text-sm text-gray-500">
            Elapsed: {formatTime(elapsed)} (Est. 11s - 6min)
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${getProgressPercentage()}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {Math.round(getProgressPercentage())}% complete
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl mb-2">🎨</div>
          <p className="text-xs font-medium text-gray-700">
            Analyzing Image
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-2xl mb-2">🎬</div>
          <p className="text-xs font-medium text-gray-700">
            Generating Frames
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl mb-2">🔊</div>
          <p className="text-xs font-medium text-gray-700">
            Creating Audio
          </p>
        </div>
      </div>

      {/* Fun Fact */}
      <div className="mt-8 text-xs text-gray-500 italic">
        "Did you know? Veo 3.1 generates videos with native audio synchronized to the scene!"
      </div>
    </div>
  );
};

export default ProgressIndicator;
