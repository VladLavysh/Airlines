<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Flights</h1>
      <div class="flex items-center gap-2">
        <USelect
          v-model="filters.flight_status"
          :items="statusOptions"
          placeholder="All statuses"
          clearable
          class="w-40"
        />
        <USelect
          v-model="filters.order"
          :items="orderOptions"
          class="w-40"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="flights.length === 0" class="text-center py-12 text-gray-500">
      No flights found.
    </div>

    <div v-else class="space-y-4">
      <UCard
        v-for="flight in flights"
        :key="flight.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/flights/${flight.id}`)"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-6 flex-1">
            <div class="text-center min-w-[80px]">
              <div class="text-lg font-bold">{{ flight.route?.departure_airport }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(flight.departure_time) }}</div>
            </div>
            <div class="flex-1 border-t border-dashed border-gray-300 relative">
              <UIcon
                name="i-lucide-plane"
                class="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 text-primary"
              />
            </div>
            <div class="text-center min-w-[80px]">
              <div class="text-lg font-bold">{{ flight.route?.arrival_airport }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(flight.arrival_time) }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-500">
              <div>{{ flight.airline?.name }}</div>
              <div>{{ flight.aircraft?.name }}</div>
            </div>
            <UBadge :color="statusColor(flight.flight_status)" variant="subtle">
              {{ flight.flight_status }}
            </UBadge>
            <div v-if="flight.price_from" class="text-right min-w-[120px]">
              <div class="font-semibold text-primary">${{ flight.price_from }}</div>
              <div class="text-xs text-gray-500">to ${{ flight.price_to }}</div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex justify-center gap-2 mt-8">
      <UButton
        :disabled="pagination.offset === 0"
        variant="outline"
        @click="prevPage"
      >
        Previous
      </UButton>
      <UButton
        :disabled="flights.length < pagination.limit"
        variant="outline"
        @click="nextPage"
      >
        Next
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { api } = useApi();

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Delayed', value: 'delayed' },
];

const orderOptions = [
  { label: 'Earliest First', value: 'asc' },
  { label: 'Latest First', value: 'desc' },
];

const filters = reactive({ flight_status: undefined as string | undefined, order: 'asc' });
const pagination = reactive({ limit: 10, offset: 0 });
const flights = ref<any[]>([]);
const loading = ref(true);

async function fetchFlights() {
  loading.value = true;
  try {
    const query: Record<string, any> = {
      limit: pagination.limit,
      offset: pagination.offset,
      order: filters.order,
      order_by: 'departure_time',
    };
    if (filters.flight_status) query.flight_status = filters.flight_status;
    const data = await api<any[]>('/flight', { query });
    flights.value = data;
  } catch {
    flights.value = [];
  } finally {
    loading.value = false;
  }
}

function nextPage() {
  pagination.offset += pagination.limit;
  fetchFlights();
}

function prevPage() {
  pagination.offset = Math.max(0, pagination.offset - pagination.limit);
  fetchFlights();
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

watch(filters, () => {
  pagination.offset = 0;
  fetchFlights();
});

onMounted(() => fetchFlights());
</script>
