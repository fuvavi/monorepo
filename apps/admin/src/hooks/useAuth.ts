import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@my-app/shared';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const logout = async () => {
    try {
      await authApi.post.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return { user, isAuthenticated: isAuthenticated(), logout };
}
