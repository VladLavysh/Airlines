<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Passengers</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New Passenger</UButton>
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
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} Passenger</h3>
          </template>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="First Name">
                <UInput v-model="form.first_name" required />
              </UFormField>
              <UFormField label="Last Name">
                <UInput v-model="form.last_name" required />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Passport Number">
                <UInput v-model="form.passport_number" required />
              </UFormField>
              <UFormField label="Email">
                <UInput v-model="form.email" type="email" required />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Phone (optional)">
                <UInput v-model="form.phone" />
              </UFormField>
              <UFormField label="Date of Birth">
                <UInput v-model="form.date_of_birth" type="date" required />
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
  { accessorKey: 'first_name', header: 'First Name' },
  { accessorKey: 'last_name', header: 'Last Name' },
  { accessorKey: 'passport_number', header: 'Passport' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'date_of_birth', header: 'DOB', accessorFn: (row: any) => {
    const d = new Date(row.date_of_birth);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } },
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
  first_name: '', last_name: '', passport_number: '',
  email: '', phone: '', date_of_birth: '',
});

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await api<any[]>('/passenger', { query: { limit: pagination.limit, offset: pagination.offset } });
  } catch { items.value = []; }
  finally { loading.value = false; }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { first_name: '', last_name: '', passport_number: '', email: '', phone: '', date_of_birth: '' });
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, {
    first_name: item.first_name, last_name: item.last_name,
    passport_number: item.passport_number, email: item.email,
    phone: item.phone || '', date_of_birth: item.date_of_birth,
  });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const body: any = { ...form };
    if (!body.phone) delete body.phone;
    if (editing.value) {
      await api(`/passenger/${editing.value}`, { method: 'PATCH', body });
      toast.add({ title: 'Passenger updated', color: 'success' });
    } else {
      await api('/passenger', { method: 'POST', body });
      toast.add({ title: 'Passenger created', color: 'success' });
      pagination.offset = 0;
    }
    showForm.value = false;
    await fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete passenger "${item.first_name} ${item.last_name}"?`)) return;
  try {
    await api(`/passenger/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'Passenger deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

function nextPage() { pagination.offset += pagination.limit; fetchItems(); }
function prevPage() { pagination.offset = Math.max(0, pagination.offset - pagination.limit); fetchItems(); }

onMounted(() => fetchItems());
</script>
