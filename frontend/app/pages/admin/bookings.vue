<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Bookings</h1>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
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
            <h3 class="text-lg font-semibold">Edit Booking #{{ editing }}</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <UFormField label="Status">
              <USelect v-model="form.status" :items="statusOptions" required />
            </UFormField>
            <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>
            <UButton type="submit" color="primary" block :loading="saving">Update</UButton>
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
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'user_id', header: 'User ID' },
  { accessorKey: 'created_at', header: 'Created', accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString() },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');
const pagination = reactive({ limit: 10, offset: 0 });

const form = reactive({ status: 'pending' });

function statusColor(status: string) {
  const c: Record<string, any> = { pending: 'warning', confirmed: 'success', cancelled: 'error' };
  return c[status] || 'neutral';
}

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/booking', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function openEdit(item: any) {
  editing.value = item.id;
  form.status = item.status;
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    await api(`/booking/${editing.value}`, { method: 'PATCH', body: { status: form.status } });
    toast.add({ title: 'Booking updated', color: 'success' });
    showForm.value = false;
    fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete booking #${item.id}?`)) return;
  try {
    await api(`/booking/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Booking deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
