export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  let isRefreshing = false;
  let refreshPromise: Promise<void> | null = null;

  async function api<T>(url: string, options: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (auth.accessToken) {
      headers['Authorization'] = `Bearer ${auth.accessToken}`;
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${url}`, {
        ...options,
        headers,
      } as any);
    } catch (error: any) {
      if (error?.response?.status === 401 && auth.refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = auth
            .refresh()
            .then(() => {
              isRefreshing = false;
              refreshPromise = null;
            })
            .catch(() => {
              isRefreshing = false;
              refreshPromise = null;
              auth.clearAuth();
              navigateTo('/login');
              throw error;
            });
        }

        await refreshPromise;

        if (auth.accessToken) {
          headers['Authorization'] = `Bearer ${auth.accessToken}`;
          return await $fetch<T>(`${config.public.apiBase}${url}`, {
            ...options,
            headers,
          } as any);
        }
      }
      throw error;
    }
  }

  return { api };
}
