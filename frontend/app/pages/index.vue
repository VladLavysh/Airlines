<template>
  <div>
    <section class="text-center py-16">
      <h1 class="text-4xl font-bold mb-4">Find Your Perfect Flight</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mb-8">
        Search hundreds of flights and book your next adventure
      </p>

      <UCard class="max-w-3xl mx-auto">
        <form @submit.prevent="searchFlights" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UInput
            v-model="search.departure"
            placeholder="From (e.g. JFK)"
            icon="i-lucide-plane-takeoff"
          />
          <UInput
            v-model="search.arrival"
            placeholder="To (e.g. LAX)"
            icon="i-lucide-plane-landing"
          />
          <UInput
            v-model="search.date"
            type="date"
            icon="i-lucide-calendar"
          />
          <UButton type="submit" color="primary" block>
            Search Flights
          </UButton>
        </form>
      </UCard>
    </section>

    <section class="py-8">
      <h2 class="text-2xl font-semibold mb-6">Available Flights</h2>

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <div v-else-if="flights.length === 0" class="text-center py-12 text-gray-500">
        No flights found. Try adjusting your search.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="flight in flights"
          :key="flight.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateTo(`/flights/${flight.id}`)"
        >
          <div class="flex items-center justify-between mb-3">
            <UBadge :color="statusColor(flight.flight_status)" variant="subtle">
              {{ flight.flight_status }}
            </UBadge>
            <span class="text-sm text-gray-500">{{ flight.airline?.name }}</span>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="text-center">
              <div class="text-lg font-bold">{{ flight.route?.departure_airport }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(flight.departure_time) }}</div>
            </div>
            <div class="flex-1 mx-4 border-t border-dashed border-gray-300 relative">
              <UIcon
                name="i-lucide-plane"
                class="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 text-primary"
              />
            </div>
            <div class="text-center">
              <div class="text-lg font-bold">{{ flight.route?.arrival_airport }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(flight.arrival_time) }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">
              {{ flight.aircraft?.name }}
            </span>
            <span v-if="flight.price_from" class="font-semibold text-primary">
              ${{ flight.price_from }} - ${{ flight.price_to }}
            </span>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { api } = useApi();

const search = reactive({
  departure: '',
  arrival: '',
  date: '',
});

const flights = ref<any[]>([]);
const loading = ref(true);

async function fetchFlights(params: Record<string, any> = {}) {
  loading.value = true;
  try {
    const data = await api<any[]>('/flight', { query: { limit: 12, ...params } });
    flights.value = data;
  } catch {
    flights.value = [];
  } finally {
    loading.value = false;
  }
}

function searchFlights() {
  const params: Record<string, any> = {};
  if (search.departure) params.departure_airport = search.departure;
  if (search.arrival) params.arrival_airport = search.arrival;
  if (search.date) params.departure_time = search.date;
  fetchFlights(params);
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: string) {
  const colors: Record<string, any> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
    delayed: 'warning',
  };
  return colors[status] || 'neutral';
}

onMounted(() => fetchFlights());
</script>
