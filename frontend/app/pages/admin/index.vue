<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label" class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo(stat.to)">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-primary/10">
            <UIcon :name="stat.icon" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stat.count }}</p>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const { api } = useApi();

const stats = ref([
  { label: 'Airlines', count: '-', icon: 'i-lucide-building-2', to: '/admin/airlines' },
  { label: 'Aircraft', count: '-', icon: 'i-lucide-plane', to: '/admin/aircraft' },
  { label: 'Flights', count: '-', icon: 'i-lucide-plane-takeoff', to: '/admin/flights' },
  { label: 'Bookings', count: '-', icon: 'i-lucide-calendar-check', to: '/admin/bookings' },
  { label: 'Tickets', count: '-', icon: 'i-lucide-ticket', to: '/admin/tickets' },
  { label: 'Routes', count: '-', icon: 'i-lucide-route', to: '/admin/routes' },
  { label: 'Passengers', count: '-', icon: 'i-lucide-users', to: '/admin/passengers' },
  { label: 'Users', count: '-', icon: 'i-lucide-shield', to: '/admin/users' },
]);

async function loadCounts() {
  const endpoints = [
    { idx: 0, url: '/airline' },
    { idx: 1, url: '/aircraft' },
    { idx: 2, url: '/flight' },
    { idx: 3, url: '/booking' },
    { idx: 4, url: '/ticket' },
    { idx: 5, url: '/route' },
    { idx: 6, url: '/passenger' },
  ];

  for (const ep of endpoints) {
    try {
      const data = await api<any[]>(ep.url, { query: { limit: 1 } });
      stats.value[ep.idx].count = Array.isArray(data) ? `${data.length}+` : '-';
    } catch {
      // keep default
    }
  }
}

onMounted(() => loadCounts());
</script>
