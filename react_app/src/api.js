import axios from 'axios';

// Vite only exposes environment variables prefixed with VITE_. Requests fall
// back to the backend on the current host, which also works for production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`,
});

export default api;
