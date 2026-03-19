import { defineStore } from 'pinia';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'admin',
    fullName: (state) =>
      state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
  },

  actions: {
    async login(email: string, password: string) {
      const config = useRuntimeConfig();
      const data = await $fetch<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password },
      });

      this.setAuth(data);
      return data;
    },

    async register(payload: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }) {
      const config = useRuntimeConfig();
      const data = await $fetch<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(`${config.public.apiBase}/auth/register`, {
        method: 'POST',
        body: payload,
      });

      this.setAuth(data);
      return data;
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('No refresh token');

      const config = useRuntimeConfig();
      try {
        const data = await $fetch<{
          accessToken: string;
          refreshToken: string;
          user: User;
        }>(`${config.public.apiBase}/auth/refresh`, {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
        });

        this.setAuth(data);
        return data;
      } catch {
        this.clearAuth();
        throw new Error('Session expired');
      }
    },

    async logout() {
      if (this.refreshToken) {
        const config = useRuntimeConfig();
        try {
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            body: { refreshToken: this.refreshToken },
          });
        } catch {
          // ignore logout errors
        }
      }
      this.clearAuth();
      navigateTo('/login');
    },

    setAuth(data: {
      accessToken: string;
      refreshToken: string;
      user: User;
    }) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      if (import.meta.client) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    },

    clearAuth() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      if (import.meta.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },

    hydrateFromStorage() {
      if (import.meta.client) {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userJson = localStorage.getItem('user');

        if (accessToken && refreshToken && userJson) {
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          try {
            this.user = JSON.parse(userJson);
          } catch {
            this.clearAuth();
          }
        }
      }
    },
  },
});
