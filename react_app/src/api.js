import axios from 'axios';

// Route API calls through Vite's same-origin proxy to avoid browser CORS
// restrictions when the frontend and Flask backend use different ports.
const api = axios.create({
  baseURL: '/api',
});

export default api;
