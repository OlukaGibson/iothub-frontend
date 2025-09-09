const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://www.gibsonalx.mooo.com/api/v1' // Use your deployment URL in production
      : 'http://localhost:8000/api/v1'), // Use localhost in development
};

export default config;