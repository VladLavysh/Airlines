<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Aircraft</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Aircraft</UButton>
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
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} Aircraft</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <UFormField label="Name">
              <UInput v-model="form.name" required />
            </UFormField>
            <UFormField label="Registration Number">
              <UInput v-model="form.registration_number" required />
            </UFormField>
            <UFormField label="Manufacturer">
              <UInput v-model="form.manufacturer" required />
            </UFormField>
            <UFormField label="Year">
              <UInput v-model.number="form.year" type="number" min="1900" max="2030" required />
            </UFormField>
            <UFormField label="Price Multiplier">
              <UInput v-model.number="form.price_multiplier" type="number" step="0.01" min="0.01" required />
            </UFormField>
            <UFormField label="Airline ID">
              <UInput v-model.number="form.airline_id" type="number" min="1" required />
            </UFormField>
            <template v-if="!editing">
              <h4 class="font-medium">Seats (JSON array)</h4>
              <UTextarea v-model="seatsJson" placeholder='[{"seat_number":"1A","seat_class_id":1}]' rows="3" />
            </template>
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
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'registration_number', header: 'Reg. Number' },
  { accessorKey: 'manufacturer', header: 'Manufacturer' },
  { accessorKey: 'year', header: 'Year' },
  { accessorKey: 'price_multiplier', header: 'Multiplier' },
  { accessorKey: 'airline_id', header: 'Airline ID' },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');
const seatsJson = ref('[]');
const pagination = reactive({ limit: 10, offset: 0 });

const form = reactive({
  name: '', registration_number: '', manufacturer: '', year: 2024,
  price_multiplier: 1.0, airline_id: 1,
});

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/aircraft', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', registration_number: '', manufacturer: '', year: 2024, price_multiplier: 1.0, airline_id: 1 });
  seatsJson.value = '[]';
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, {
    name: item.name, registration_number: item.registration_number,
    manufacturer: item.manufacturer, year: item.year,
    price_multiplier: Number(item.price_multiplier), airline_id: item.airline_id,
  });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    if (editing.value) {
      await api(`/aircraft/${editing.value}`, { method: 'PATCH', body: { ...form } });
      toast.add({ title: 'Aircraft updated', color: 'success' });
    } else {
      let seats: any[] = [];
      try { seats = JSON.parse(seatsJson.value); } catch { formError.value = 'Invalid seats JSON'; saving.value = false; return; }
      await api('/aircraft', { method: 'POST', body: { ...form, seats } });
      toast.add({ title: 'Aircraft created', color: 'success' });
    }
    showForm.value = false;
    fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete aircraft "${item.name}"?`)) return;
  try {
    await api(`/aircraft/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Aircraft deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
