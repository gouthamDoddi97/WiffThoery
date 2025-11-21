// Helper function to get the correct asset path for both dev and production
export const getAssetPath = (path) => {
    // In development, BASE_URL is '/', in production it's '/WiffThoery/'
    const base = import.meta.env.BASE_URL;
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${base}${cleanPath}`;
};
