<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">My Bookings</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="createBooking" :loading="creating">
        New Booking
      </UButton>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-12 text-gray-500">
      You don't have any bookings yet.
    </div>

    <div v-else class="space-y-4">
      <UCard
        v-for="b in bookings"
        :key="b.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/bookings/${b.id}`)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">Booking #{{ b.id }}</p>
            <p class="text-sm text-gray-500">
              Created {{ formatDate(b.created_at) }}
            </p>
          </div>
          <UBadge :color="bookingStatusColor(b.status)" variant="subtle">
            {{ b.status }}
          </UBadge>
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
        :disabled="bookings.length < pagination.limit"
        variant="outline"
        @click="nextPage"
      >
        Next
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { api } = useApi();
const toast = useToast();

const bookings = ref<any[]>([]);
const loading = ref(true);
const creating = ref(false);
const pagination = reactive({ limit: 10, offset: 0 });

async function fetchBookings() {
  loading.value = true;
  try {
    bookings.value = await api<any[]>('/booking', {
      query: { limit: pagination.limit, offset: pagination.offset },
    });
  } catch {
    bookings.value = [];
  } finally {
    loading.value = false;
  }
}

async function createBooking() {
  creating.value = true;
  try {
    const newBooking = await api<any>('/booking', { method: 'POST', body: {} });
    toast.add({ title: 'Booking created', color: 'success' });
    navigateTo(`/bookings/${newBooking.id}`);
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to create booking', color: 'error' });
  } finally {
    creating.value = false;
  }
}

function nextPage() {
  pagination.offset += pagination.limit;
  fetchBookings();
}

function prevPage() {
  pagination.offset = Math.max(0, pagination.offset - pagination.limit);
  fetchBookings();
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

onMounted(() => fetchBookings());
</script>
