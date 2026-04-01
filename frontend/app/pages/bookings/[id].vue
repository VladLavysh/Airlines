<template>
  <div>
    <UButton to="/bookings" variant="ghost" icon="i-lucide-arrow-left" class="mb-4">
      Back to Bookings
    </UButton>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="booking">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Booking #{{ booking.id }}</h1>
          <p class="text-sm text-gray-500">Created {{ formatDate(booking.created_at) }}</p>
          <div v-if="booking.status === 'pending' && timeRemaining > 0" class="mt-2">
            <p class="text-sm font-medium text-orange-600 dark:text-orange-400">
              <UIcon name="i-lucide-clock" class="w-4 h-4 inline" />
              Time remaining: {{ formatTimeRemaining(timeRemaining) }}
            </p>
            <p class="text-xs text-gray-500">Add passengers and confirm before time expires</p>
          </div>
        </div>
        <UBadge :color="bookingStatusColor(booking.status)" variant="subtle" size="lg">
          {{ booking.status }}
        </UBadge>
      </div>

      <!-- Flight Information Card -->
      <UCard v-if="booking.flight" class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-plane" class="w-5 h-5" />
            <h2 class="text-lg font-semibold">Flight Information</h2>
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Route Information -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Route</h3>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-plane-takeoff" class="w-4 h-4 text-blue-500" />
                <span class="font-medium">{{ booking.flight.route?.departure_airport }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-plane-landing" class="w-4 h-4 text-green-500" />
                <span class="font-medium">{{ booking.flight.route?.arrival_airport }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Distance: {{ booking.flight.route?.distance }} km
              </p>
              <p class="text-xs text-gray-500">
                Base Price: ${{ booking.flight.route?.base_price }}
              </p>
            </div>
          </div>

          <!-- Airline Information -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Airline</h3>
            <div class="space-y-1">
              <p class="font-medium">{{ booking.flight.airline?.name }}</p>
              <p class="text-sm text-gray-600">{{ booking.flight.airline?.iata_code }}</p>
              <p class="text-xs text-gray-500">{{ booking.flight.airline?.country }}</p>
              <p class="text-xs text-gray-500">
                Price Multiplier: {{ booking.flight.airline?.price_multiplier }}x
              </p>
            </div>
          </div>

          <!-- Aircraft Information -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Aircraft</h3>
            <div class="space-y-1">
              <p class="font-medium">{{ booking.flight.aircraft?.name }}</p>
              <p class="text-sm text-gray-600">{{ booking.flight.aircraft?.manufacturer }}</p>
              <p class="text-xs text-gray-500">
                Registration: {{ booking.flight.aircraft?.registration_number }}
              </p>
              <p class="text-xs text-gray-500">Year: {{ booking.flight.aircraft?.year }}</p>
              <p class="text-xs text-gray-500">
                Price Multiplier: {{ booking.flight.aircraft?.price_multiplier }}x
              </p>
            </div>
          </div>

          <!-- Flight Schedule -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Schedule</h3>
            <div class="space-y-1">
              <div>
                <p class="text-xs text-gray-500">Departure</p>
                <p class="font-medium">{{ formatDate(booking.flight.departure_time) }}</p>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-500">Arrival</p>
                <p class="font-medium">{{ formatDate(booking.flight.arrival_time) }}</p>
              </div>
            </div>
          </div>

          <!-- Flight Status -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <UBadge :color="flightStatusColor(booking.flight.flight_status)" variant="subtle" size="lg">
              {{ booking.flight.flight_status }}
            </UBadge>
          </div>

          <!-- Booking Summary -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Booking Summary</h3>
            <div class="space-y-1">
              <p class="text-sm">
                <span class="text-gray-500">Passengers:</span>
                <span class="font-medium ml-1">{{ tickets.length }}</span>
              </p>
              <p v-if="booking.status === 'confirmed'" class="text-sm">
                <span class="text-gray-500">Total:</span>
                <span class="font-medium ml-1 text-primary">${{ totalPrice }}</span>
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Passengers</h2>
            <UButton
              v-if="booking.status === 'pending'"
              color="primary"
              size="sm"
              icon="i-lucide-plus"
              @click="showAddTicket = true"
            >
              Add Passenger
            </UButton>
          </div>

          <div v-if="tickets.length === 0" class="text-center py-8 text-gray-500">
            No passengers yet. Add at least one passenger to confirm this booking.
          </div>

          <UCard v-for="ticket in tickets" :key="ticket.id">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-medium">
                  {{ ticket.passenger?.first_name }} {{ ticket.passenger?.last_name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ ticket.flight?.route?.departure_airport }} →
                  {{ ticket.flight?.route?.arrival_airport }}
                </p>
                <p class="text-xs text-gray-400">
                  Seat: {{ ticket.seat?.seat_number }} ({{ ticket.seat?.class?.name }})
                </p>
                <p v-if="booking.status === 'confirmed'" class="text-xs text-gray-400 mt-1">
                  Passport: {{ ticket.passenger?.passport_number }}
                </p>
              </div>
              <div v-if="booking.status === 'confirmed'" class="text-right">
                <p class="font-semibold text-primary">${{ ticket.price }}</p>
                <p class="text-xs text-gray-500">{{ ticket.currency }}</p>
              </div>
              <div v-else class="text-right">
                <UBadge color="warning" variant="subtle">Pending</UBadge>
              </div>
            </div>
          </UCard>
        </div>

        <div>
          <UCard>
            <template #header>
              <h3 class="font-semibold">Booking Actions</h3>
            </template>
            <div class="space-y-3">
              <UButton
                v-if="booking.status === 'pending'"
                color="primary"
                block
                :disabled="tickets.length === 0"
                @click="updateStatus('confirmed')"
              >
                Confirm Booking
              </UButton>
              <p v-if="booking.status === 'pending' && tickets.length === 0" class="text-xs text-gray-500 text-center">
                Add at least one passenger to confirm
              </p>
              <UButton
                v-if="booking.status !== 'cancelled'"
                color="error"
                variant="soft"
                block
                @click="updateStatus('cancelled')"
              >
                Cancel Booking
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <UModal v-model:open="showAddTicket">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Add Passenger</h3>
          </template>
          <form @submit.prevent="addTicket" class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                <UIcon name="i-lucide-info" class="w-4 h-4 inline" />
                A seat will be automatically assigned when you add this passenger
              </p>
            </div>
            <h4 class="font-medium">Passenger Info</h4>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="First Name">
                <UInput v-model="ticketForm.passenger.first_name" required />
              </UFormField>
              <UFormField label="Last Name">
                <UInput v-model="ticketForm.passenger.last_name" required />
              </UFormField>
            </div>
            <UFormField label="Email">
              <UInput v-model="ticketForm.passenger.email" type="email" required />
            </UFormField>
            <UFormField label="Passport Number">
              <UInput v-model="ticketForm.passenger.passport_number" required />
            </UFormField>
            <UFormField label="Date of Birth">
              <UInput v-model="ticketForm.passenger.date_of_birth" type="date" required />
            </UFormField>
            <UFormField label="Phone (optional)">
              <UInput v-model="ticketForm.passenger.phone" />
            </UFormField>
            <p v-if="ticketError" class="text-sm text-red-500">{{ ticketError }}</p>
            <UButton type="submit" color="primary" block :loading="addingTicket">
              Add Passenger
            </UButton>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { api } = useApi();
const toast = useToast();

const booking = ref<any>(null);
const tickets = ref<any[]>([]);
const loading = ref(true);
const showAddTicket = ref(false);
const addingTicket = ref(false);
const ticketError = ref('');
const timeRemaining = ref(0);
let timerInterval: NodeJS.Timeout | null = null;

const ticketForm = reactive({
  passenger: {
    first_name: '',
    last_name: '',
    email: '',
    passport_number: '',
    date_of_birth: '',
    phone: '',
  },
});

async function fetchBooking() {
  loading.value = true;
  try {
    booking.value = await api<any>(`/booking/${route.params.id}`);
    await fetchTickets();
    startTimer();
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    booking.value = null;
  } finally {
    loading.value = false;
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  if (booking.value?.status !== 'pending') {
    timeRemaining.value = 0;
    return;
  }
  
  const updateTimer = () => {
    const createdAt = new Date(booking.value.created_at).getTime();
    const expiresAt = createdAt + 15 * 60 * 1000; // 15 minutes
    const now = Date.now();
    const remaining = Math.max(0, expiresAt - now);
    
    timeRemaining.value = remaining;
    
    if (remaining === 0) {
      if (timerInterval) clearInterval(timerInterval);
      fetchBooking(); // Refresh to get updated status
    }
  };
  
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchTickets() {
  try {
    tickets.value = await api<any[]>('/ticket', {
      query: { booking_id: route.params.id, limit: 50 },
    });
  } catch {
    tickets.value = [];
  }
}

async function addTicket() {
  addingTicket.value = true;
  ticketError.value = '';
  try {
    const body: any = {
      booking_id: Number(route.params.id),
      passenger: { ...ticketForm.passenger },
    };
    if (!body.passenger.phone) delete body.passenger.phone;

    await api<any>('/ticket', { method: 'POST', body });
    toast.add({ title: 'Passenger added!', description: 'Seat automatically assigned', color: 'success' });
    showAddTicket.value = false;
    resetTicketForm();
    await fetchTickets();
  } catch (e: any) {
    ticketError.value = e?.data?.message || 'Failed to add passenger';
  } finally {
    addingTicket.value = false;
  }
}

async function updateStatus(status: string) {
  try {
    await api<any>(`/booking/${route.params.id}`, {
      method: 'PATCH',
      body: { status },
    });
    toast.add({ title: `Booking ${status}`, color: 'success' });
    await fetchBooking();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to update', color: 'error' });
  }
}

function resetTicketForm() {
  ticketForm.passenger.first_name = '';
  ticketForm.passenger.last_name = '';
  ticketForm.passenger.email = '';
  ticketForm.passenger.passport_number = '';
  ticketForm.passenger.date_of_birth = '';
  ticketForm.passenger.phone = '';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const totalPrice = computed(() => {
  return tickets.value.reduce((sum, ticket) => sum + parseFloat(ticket.price || 0), 0).toFixed(2);
});

function bookingStatusColor(status: string) {
  const colors: Record<string, any> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'error',
  };
  return colors[status] || 'neutral';
}

function flightStatusColor(status: string) {
  const colors: Record<string, any> = {
    scheduled: 'blue',
    boarding: 'yellow',
    departed: 'green',
    arrived: 'success',
    delayed: 'orange',
    cancelled: 'error',
  };
  return colors[status.toLowerCase()] || 'neutral';
}

onMounted(() => fetchBooking());

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
