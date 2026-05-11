export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
};

export const api = (path: string) => {
  const base = config.apiUrl || '';
  return `${base}${path}`;
};
