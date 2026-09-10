// Centralized API base URL
// Priority: VITE_API_URL env > current hostname with backend default port 4000
export const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : `${window.location.protocol}//${window.location.hostname}:4000`;


