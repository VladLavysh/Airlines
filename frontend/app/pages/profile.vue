<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">My Profile</h1>

    <UCard>
      <form @submit.prevent="handleUpdate" class="space-y-4">
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

        <UFormField label="New Password" hint="Leave blank to keep current">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter new password"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton type="submit" color="primary" :loading="loading">
            Save Changes
          </UButton>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { api } = useApi();
const auth = useAuthStore();
const toast = useToast();

const form = reactive({
  first_name: auth.user?.first_name || '',
  last_name: auth.user?.last_name || '',
  email: auth.user?.email || '',
  password: '',
});
const loading = ref(false);
const error = ref('');

async function handleUpdate() {
  loading.value = true;
  error.value = '';
  try {
    const body: Record<string, string> = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
    };
    if (form.password) body.password = form.password;

    const updatedUser = await api<any>('/user/me', { method: 'PATCH', body });

    if (auth.user) {
      auth.user.first_name = updatedUser.first_name;
      auth.user.last_name = updatedUser.last_name;
      auth.user.email = updatedUser.email;
      if (import.meta.client) {
        localStorage.setItem('user', JSON.stringify(auth.user));
      }
    }

    form.password = '';
    toast.add({ title: 'Profile updated', color: 'success' });
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update profile';
  } finally {
    loading.value = false;
  }
}
</script>
