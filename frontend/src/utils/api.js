import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

export const API_BASE_URL = api.defaults.baseURL;
export const SERVER_BASE_URL = String(API_BASE_URL || '').replace(/\/api\/?$/, '');

export function getUploadUrl(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, '/').replace(/^\/+/, '');
  // multer stores e.g. "uploads/123.pdf" (relative). We serve it at "/uploads".
  const relative = normalized.startsWith('uploads/') ? normalized : `uploads/${normalized.replace(/^uploads\/?/, '')}`;
  return `${SERVER_BASE_URL}/${relative}`;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;