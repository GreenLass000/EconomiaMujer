import axios from 'axios';

// Flask-CORS allows browser requests from the frontend origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`,
});

export default api;
