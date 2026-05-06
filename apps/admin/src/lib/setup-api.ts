import { createApiClient } from '@my-app/shared';

export function setupApiClient(onUnauthorized: () => void) {
  createApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
    getToken: () => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('admin_accessToken');
    },
    onUnauthorized,
  });
}
