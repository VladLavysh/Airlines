<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Flights</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Flight</UButton>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #flight_status-cell="{ row }">
          <UBadge :color="statusColor(row.original.flight_status)" variant="subtle">
            {{ row.original.flight_status }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row.original)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(row.original)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <div class="flex justify-center gap-2 mt-4">
      <UButton :disabled="pagination.offset === 0" variant="outline" size="sm" @click="prevPage">Previous</UButton>
      <UButton :disabled="items.length < pagination.limit" variant="outline" size="sm" @click="nextPage">Next</UButton>
    </div>

    <UModal v-model:open="showForm">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} Flight</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Departure Time">
                <UInput v-model="form.departure_time" type="datetime-local" required />
              </UFormField>
              <UFormField label="Arrival Time">
                <UInput v-model="form.arrival_time" type="datetime-local" required />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Status">
                <USelect v-model="form.flight_status" :items="statusOptions" required />
              </UFormField>
              <UFormField label="Route ID">
                <UInput v-model.number="form.route_id" type="number" min="1" required />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Aircraft ID">
                <UInput v-model.number="form.aircraft_id" type="number" min="1" required />
              </UFormField>
              <UFormField label="Airline ID">
                <UInput v-model.number="form.airline_id" type="number" min="1" required />
              </UFormField>
            </div>
            <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>
            <UButton type="submit" color="primary" block :loading="saving">{{ editing ? 'Update' : 'Create' }}</UButton>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const { api } = useApi();
const toast = useToast();

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Delayed', value: 'delayed' },
];

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'flight_status', header: 'Status' },
  { accessorKey: 'departure_time', header: 'Departure', accessorFn: (row: any) => formatDT(row.departure_time) },
  { accessorKey: 'arrival_time', header: 'Arrival', accessorFn: (row: any) => formatDT(row.arrival_time) },
  { accessorKey: 'route_id', header: 'Route', accessorFn: (row: any) => row.route ? `${row.route.departure_airport}→${row.route.arrival_airport}` : row.route_id },
  { accessorKey: 'airline_id', header: 'Airline', accessorFn: (row: any) => row.airline?.name || row.airline_id },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');
const pagination = reactive({ limit: 10, offset: 0 });

const form = reactive({
  departure_time: '', arrival_time: '', flight_status: 'pending',
  route_id: 1, aircraft_id: 1, airline_id: 1,
});

function formatDT(d: string) {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function statusColor(status: string) {
  const c: Record<string, any> = { pending: 'warning', in_progress: 'info', completed: 'success', cancelled: 'error', delayed: 'warning' };
  return c[status] || 'neutral';
}

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/flight', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function toLocalDatetime(d: string) {
  const dt = new Date(d);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { departure_time: '', arrival_time: '', flight_status: 'pending', route_id: 1, aircraft_id: 1, airline_id: 1 });
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, {
    departure_time: toLocalDatetime(item.departure_time),
    arrival_time: toLocalDatetime(item.arrival_time),
    flight_status: item.flight_status, route_id: item.route_id || item.route?.id,
    aircraft_id: item.aircraft_id || item.aircraft?.id, airline_id: item.airline_id || item.airline?.id,
  });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const body = {
      ...form,
      departure_time: new Date(form.departure_time).toISOString(),
      arrival_time: new Date(form.arrival_time).toISOString(),
    };
    if (editing.value) {
      await api(`/flight/${editing.value}`, { method: 'PATCH', body });
      toast.add({ title: 'Flight updated', color: 'success' });
    } else {
      await api('/flight', { method: 'POST', body });
      toast.add({ title: 'Flight created', color: 'success' });
      pagination.offset = 0;
    }
    showForm.value = false;
    await fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete flight #${item.id}?`)) return;
  try {
    await api(`/flight/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Flight deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
