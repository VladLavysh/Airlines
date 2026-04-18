<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="text-xl font-bold text-primary">
              ✈ Airlines
            </NuxtLink>
            <nav class="hidden md:flex items-center gap-4">
              <UButton to="/flights" variant="ghost" color="neutral">
                Flights
              </UButton>
              <UButton
                v-if="auth.isAuthenticated"
                to="/bookings"
                variant="ghost"
                color="neutral"
              >
                My Bookings
              </UButton>
            </nav>
          </div>

          <div class="flex items-center gap-2">
            <ClientOnly>
              <template v-if="auth.isAuthenticated">
                <UButton
                  v-if="auth.isAdmin"
                  to="/admin"
                  variant="soft"
                  color="primary"
                  size="sm"
                >
                  Admin
                </UButton>
                <UDropdownMenu :items="userMenuItems">
                  <UButton variant="ghost" color="neutral">
                    {{ auth.fullName }}
                    <UIcon name="i-lucide-chevron-down" class="ml-1" />
                  </UButton>
                </UDropdownMenu>
              </template>
              <template v-else>
                <UButton to="/login" variant="ghost" color="neutral">
                  Login
                </UButton>
                <UButton to="/register" color="primary">
                  Register
                </UButton>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <AiAssistant />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();

const userMenuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      onSelect: () => navigateTo('/profile'),
    },
    {
      label: 'My Bookings',
      icon: 'i-lucide-ticket',
      onSelect: () => navigateTo('/bookings'),
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => auth.logout(),
    },
  ],
]);
</script>
