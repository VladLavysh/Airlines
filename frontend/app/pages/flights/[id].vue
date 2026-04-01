<template>
  <div>
    <UButton to="/flights" variant="ghost" icon="i-lucide-arrow-left" class="mb-4">
      Back to Flights
    </UButton>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="flight">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h1 class="text-xl font-bold">Flight Details</h1>
              <UBadge :color="statusColor(flight.flight_status)" variant="subtle" size="lg">
                {{ flight.flight_status }}
              </UBadge>
            </div>
          </template>

          <div class="flex items-center justify-between py-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ flight.route?.departure_airport }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(flight.departure_time) }}</div>
              <div class="text-lg font-semibold">{{ formatTimeOnly(flight.departure_time) }}</div>
            </div>
            <div class="flex-1 mx-8 border-t-2 border-dashed border-gray-300 relative">
              <UIcon
                name="i-lucide-plane"
                class="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 text-primary"
              />
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ flight.route?.arrival_airport }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(flight.arrival_time) }}</div>
              <div class="text-lg font-semibold">{{ formatTimeOnly(flight.arrival_time) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <span class="text-sm text-gray-500">Airline</span>
              <p class="font-medium">{{ flight.airline?.name }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Aircraft</span>
              <p class="font-medium">{{ flight.aircraft?.name }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Distance</span>
              <p class="font-medium">{{ flight.route?.distance }} km</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Base Price</span>
              <p class="font-medium">${{ flight.route?.base_price }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">Pricing</h2>
          </template>

          <div class="space-y-3">
            <div v-if="flight.price_from">
              <span class="text-sm text-gray-500">Price Range</span>
              <p class="text-2xl font-bold text-primary">
                ${{ flight.price_from }} - ${{ flight.price_to }}
              </p>
            </div>
            <p class="text-sm text-gray-500">
              Final price depends on seat class selection.
            </p>
          </div>

          <template #footer>
            <UButton
              v-if="auth.isAuthenticated"
              color="primary"
              block
              size="lg"
              @click="bookFlight"
              :loading="booking"
            >
              Book This Flight
            </UButton>
            <UButton
              v-else
              to="/login"
              color="primary"
              block
              size="lg"
            >
              Login to Book
            </UButton>
          </template>
        </UCard>
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">
      Flight not found.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const route = useRoute();
const { api } = useApi();
const auth = useAuthStore();
const toast = useToast();

const flight = ref<any>(null);
const loading = ref(true);
const booking = ref(false);

async function fetchFlight() {
  loading.value = true;
  try {
    flight.value = await api<any>(`/flight/${route.params.id}`);
  } catch {
    flight.value = null;
  } finally {
    loading.value = false;
  }
}

async function bookFlight() {
  booking.value = true;
  try {
    const newBooking = await api<any>('/booking', { method: 'POST', body: { flight_id: Number(route.params.id) } });
    toast.add({ title: 'Booking created!', description: 'Now add passengers to your booking.', color: 'success' });
    navigateTo(`/bookings/${newBooking.id}`);
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to create booking', color: 'error' });
  } finally {
    booking.value = false;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeOnly(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
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

onMounted(() => fetchFlight());
</script>
