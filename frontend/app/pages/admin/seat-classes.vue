<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Seat Classes</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Seat Class</UButton>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
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
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} Seat Class</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <UFormField label="Name">
              <UInput v-model="form.name" required />
            </UFormField>
            <UFormField label="Price Multiplier">
              <UInput v-model.number="form.price_multiplier" type="number" step="0.01" min="0.01" required />
            </UFormField>
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
  { accessorKey: 'price_multiplier', header: 'Multiplier' },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');
const pagination = reactive({ limit: 10, offset: 0 });

const form = reactive({ name: '', price_multiplier: 1.0 });

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/seat-class', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', price_multiplier: 1.0 });
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, { name: item.name, price_multiplier: Number(item.price_multiplier) });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    if (editing.value) {
      await api(`/seat-class/${editing.value}`, { method: 'PATCH', body: { ...form } });
      toast.add({ title: 'Seat class updated', color: 'success' });
    } else {
      await api('/seat-class', { method: 'POST', body: { ...form } });
      toast.add({ title: 'Seat class created', color: 'success' });
    }
    showForm.value = false;
    fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete seat class "${item.name}"?`)) return;
  try {
    await api(`/seat-class/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Seat class deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
