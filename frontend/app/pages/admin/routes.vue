<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Routes</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Route</UButton>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(row)" />
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
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} Route</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Departure Airport">
                <UInput v-model="form.departure_airport" required />
              </UFormField>
              <UFormField label="Arrival Airport">
                <UInput v-model="form.arrival_airport" required />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Distance (km)">
                <UInput v-model.number="form.distance_km" type="number" min="1" required />
              </UFormField>
              <UFormField label="Base Price">
                <UInput v-model.number="form.base_price" type="number" step="0.01" min="0.01" required />
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

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'departure_airport', header: 'Departure' },
  { accessorKey: 'arrival_airport', header: 'Arrival' },
  { accessorKey: 'distance', header: 'Distance (km)' },
  { accessorKey: 'base_price', header: 'Base Price' },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');
const pagination = reactive({ limit: 10, offset: 0 });

const form = reactive({ departure_airport: '', arrival_airport: '', distance_km: 0, base_price: 0 });

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/route', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { departure_airport: '', arrival_airport: '', distance_km: 0, base_price: 0 });
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, { departure_airport: item.departure_airport, arrival_airport: item.arrival_airport, distance_km: item.distance, base_price: Number(item.base_price) });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    if (editing.value) {
      await api(`/route/${editing.value}`, { method: 'PATCH', body: { ...form } });
      toast.add({ title: 'Route updated', color: 'success' });
    } else {
      await api('/route', { method: 'POST', body: { ...form } });
      toast.add({ title: 'Route created', color: 'success' });
      pagination.offset = 0;
    }
    showForm.value = false;
    await fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete route ${item.departure_airport} → ${item.arrival_airport}?`)) return;
  try {
    await api(`/route/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Route deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
