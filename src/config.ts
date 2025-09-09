const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? '/api/v1' // Use relative path in production with FastAPI v1 prefix
      : 'http://localhost:8000/api/v1'), // Use direct URL in development with FastAPI v1 prefix
};

export default config;