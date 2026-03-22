<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-center">Login</h1>
      </template>

      <UAlert
        icon="i-lucide-info"
        color="info"
        variant="soft"
        title="Demo Credentials"
        description="Click to auto-fill credentials for testing"
        class="mb-4"
      >
        <template #actions>
          <div class="flex gap-2">
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              @click="fillUser"
            >
              User
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              @click="fillAdmin"
            >
              Admin
            </UButton>
          </div>
        </template>
      </UAlert>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              size="lg"
              required
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Your password"
              icon="i-lucide-lock"
              size="lg"
              required
            />
          </UFormGroup>
        </div>

        <UButton type="submit" color="primary" block :loading="loading">
          Login
        </UButton>

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary font-medium">Register</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const auth = useAuthStore();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

function fillUser() {
  form.email = 'user@mail.com';
  form.password = 'someTestPass_123';
}

function fillAdmin() {
  form.email = 'admin@mail.com';
  form.password = 'someTestPass_123';
}

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(form.email, form.password);
    navigateTo('/');
  } catch (e: any) {
    error.value = e?.data?.message || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>
