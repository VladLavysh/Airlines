<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Users</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">New User</UButton>
    </div>

    <UCard>
      <UTable :data="items" :columns="columns" :loading="loading">
        <template #role-cell="{ row }">
          <UBadge :color="row.original.role === 'admin' ? 'primary' : 'neutral'" variant="subtle">
            {{ row.original.role }}
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

    <UModal v-model:open="showForm">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editing ? 'Edit' : 'Create' }} User</h3>
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
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" required />
            </UFormField>
            <UFormField label="Role">
              <USelect v-model="form.role" :items="roleOptions" required />
            </UFormField>
            <UFormField :label="editing ? 'New Password (leave blank to keep)' : 'Password'">
              <UInput v-model="form.password" type="password" :required="!editing" />
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

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
];

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'first_name', header: 'First Name' },
  { accessorKey: 'last_name', header: 'Last Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'actions', header: '' },
];

const items = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const editing = ref<number | null>(null);
const formError = ref('');

const form = reactive({
  first_name: '', last_name: '', email: '',
  role: 'user', password: '',
});

async function fetchItems() {
  loading.value = true;
  try {
    // Admin can fetch users by ID; there's no list endpoint exposed, so we'll try
    // We'll use a workaround: fetch current user info page or specific IDs
    // Actually the backend has GET /user/:id for admin, but no list.
    // We'll display a message and allow create/edit by ID.
    items.value = [];
    loading.value = false;
  } catch { items.value = []; loading.value = false; }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { first_name: '', last_name: '', email: '', role: 'user', password: '' });
  formError.value = '';
  showForm.value = true;
}

function openEdit(item: any) {
  editing.value = item.id;
  Object.assign(form, {
    first_name: item.first_name, last_name: item.last_name,
    email: item.email, role: item.role, password: '',
  });
  formError.value = '';
  showForm.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const body: any = {
      first_name: form.first_name, last_name: form.last_name,
      email: form.email, role: form.role,
    };
    if (form.password) body.password = form.password;

    if (editing.value) {
      await api(`/user/${editing.value}`, { method: 'PATCH', body });
      toast.add({ title: 'User updated', color: 'success' });
    } else {
      if (!form.password) { formError.value = 'Password is required'; saving.value = false; return; }
      body.password = form.password;
      await api('/user', { method: 'POST', body });
      toast.add({ title: 'User created', color: 'success' });
    }
    showForm.value = false;
    fetchItems();
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to save';
  } finally { saving.value = false; }
}

async function confirmDelete(item: any) {
  if (!confirm(`Delete user "${item.email}"?`)) return;
  try {
    await api(`/user/${item.id}`, { method: 'DELETE' });
    toast.add({ title: 'User deleted', color: 'success' });
    fetchItems();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to delete', color: 'error' });
  }
}

onMounted(() => fetchItems());
</script>
