export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    auth.hydrateFromStorage();
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login');
  }

  if (!auth.isAdmin) {
    return navigateTo('/');
  }
});
