<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <NuxtLink to="/" class="text-xl font-bold text-primary">
          ✈ Airlines
        </NuxtLink>
        <p class="text-xs text-gray-500 mt-1">Admin Dashboard</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="[
            isActive(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <div class="text-sm font-medium">{{ auth.fullName }}</div>
        <div class="text-xs text-gray-500">{{ auth.user?.email }}</div>
        <UButton
          class="mt-2 w-full"
          variant="soft"
          color="neutral"
          size="sm"
          @click="auth.logout()"
        >
          Logout
        </UButton>
        <UButton
          class="mt-1 w-full"
          variant="ghost"
          color="neutral"
          size="sm"
          to="/"
        >
          Back to Site
        </UButton>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Airlines', to: '/admin/airlines', icon: 'i-lucide-building-2' },
  { label: 'Aircraft', to: '/admin/aircraft', icon: 'i-lucide-plane' },
  { label: 'Routes', to: '/admin/routes', icon: 'i-lucide-route' },
  { label: 'Flights', to: '/admin/flights', icon: 'i-lucide-plane-takeoff' },
  { label: 'Seat Classes', to: '/admin/seat-classes', icon: 'i-lucide-armchair' },
  { label: 'Passengers', to: '/admin/passengers', icon: 'i-lucide-users' },
  { label: 'Bookings', to: '/admin/bookings', icon: 'i-lucide-calendar-check' },
  { label: 'Tickets', to: '/admin/tickets', icon: 'i-lucide-ticket' },
  { label: 'Users', to: '/admin/users', icon: 'i-lucide-shield' },
];

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin';
  return route.path.startsWith(to);
}
</script>
