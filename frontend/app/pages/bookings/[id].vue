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
        </div>
        <UBadge :color="bookingStatusColor(booking.status)" variant="subtle" size="lg">
          {{ booking.status }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Tickets</h2>
            <UButton
              color="primary"
              size="sm"
              icon="i-lucide-plus"
              @click="showAddTicket = true"
            >
              Add Ticket
            </UButton>
          </div>

          <div v-if="tickets.length === 0" class="text-center py-8 text-gray-500">
            No tickets yet. Add a ticket to this booking.
          </div>

          <UCard v-for="ticket in tickets" :key="ticket.id">
            <div class="flex items-center justify-between">
              <div>
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
              </div>
              <div class="text-right">
                <p class="font-semibold text-primary">${{ ticket.price }}</p>
                <p class="text-xs text-gray-500">{{ ticket.currency }}</p>
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
                @click="updateStatus('confirmed')"
              >
                Confirm Booking
              </UButton>
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
            <h3 class="text-lg font-semibold">Add Ticket</h3>
          </template>
          <form @submit.prevent="addTicket" class="space-y-4">
            <UFormField label="Flight ID">
              <UInput v-model.number="ticketForm.flight_id" type="number" required />
            </UFormField>
            <UFormField label="Seat ID">
              <UInput v-model.number="ticketForm.seat_id" type="number" required />
            </UFormField>
            <h4 class="font-medium pt-2">Passenger Info</h4>
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
              Add Ticket
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

const ticketForm = reactive({
  flight_id: 0,
  seat_id: 0,
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
  } catch {
    booking.value = null;
  } finally {
    loading.value = false;
  }
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
      flight_id: ticketForm.flight_id,
      seat_id: ticketForm.seat_id,
      passenger: { ...ticketForm.passenger },
    };
    if (!body.passenger.phone) delete body.passenger.phone;

    await api<any>('/ticket', { method: 'POST', body });
    toast.add({ title: 'Ticket added', color: 'success' });
    showAddTicket.value = false;
    resetTicketForm();
    await fetchTickets();
  } catch (e: any) {
    ticketError.value = e?.data?.message || 'Failed to add ticket';
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
  ticketForm.flight_id = 0;
  ticketForm.seat_id = 0;
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

function bookingStatusColor(status: string) {
  const colors: Record<string, any> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'error',
  };
  return colors[status] || 'neutral';
}

onMounted(() => fetchBooking());
</script>
