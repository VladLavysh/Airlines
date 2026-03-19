<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Tickets</h1>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #actions-cell="{ row }">
          <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(row.original)" />
        </template>
      </UTable>
    </UCard>

    <div class="flex justify-center gap-2 mt-4">
      <UButton :disabled="pagination.offset === 0" variant="outline" size="sm" @click="prevPage">Previous</UButton>
      <UButton :disabled="items.length < pagination.limit" variant="outline" size="sm" @click="nextPage">Next</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const { api } = useApi();
const toast = useToast();

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'currency', header: 'Currency' },
  { accessorKey: 'booking_id', header: 'Booking ID' },
  { accessorKey: 'flight_id', header: 'Flight ID' },
  { accessorKey: 'seat_id', header: 'Seat ID' },
  { accessorKey: 'passenger_id', header: 'Passenger ID' },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const pagination = reactive({ limit: 10, offset: 0 });

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/ticket', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete ticket #${item.id}?`)) return;
  try {
    await api(`/ticket/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Ticket deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
