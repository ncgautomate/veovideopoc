import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload an image file to the backend
 * @param {File} file - The image file to upload
 * @returns {Promise} Response with image_id
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Start video generation process
 * @param {Object} params - Video generation parameters
 * @returns {Promise} Response with operation_id
 */
export const generateVideo = async (params) => {
  const response = await api.post('/api/generate-video', params);
  return response.data;
};

/**
 * Check video generation status
 * @param {string} operationId - The operation ID from generateVideo
 * @returns {Promise} Response with status information
 */
export const checkVideoStatus = async (operationId) => {
  const response = await api.get(`/api/video-status/${operationId}`);
  return response.data;
};

/**
 * Get the full URL for a video
 * @param {string} videoUrl - Relative video URL from API
 * @returns {string} Full video URL
 */
export const getVideoUrl = (videoUrl) => {
  return `${API_BASE_URL}${videoUrl}`;
};

/**
 * Check API health status
 * @returns {Promise} Health status
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
