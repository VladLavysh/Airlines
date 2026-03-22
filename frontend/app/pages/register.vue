<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-center">Create Account</h1>
      </template>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="First Name" name="first_name">
            <UInput
              v-model="form.first_name"
              placeholder="John"
              icon="i-lucide-user"
              size="lg"
              required
            />
          </UFormGroup>
          <UFormGroup label="Last Name" name="last_name">
            <UInput
              v-model="form.last_name"
              placeholder="Doe"
              icon="i-lucide-user"
              size="lg"
              required
            />
          </UFormGroup>
        </div>

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

          <UFormGroup label="Password" name="password" hint="Min 8 chars, uppercase, lowercase, number, special char">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Strong password"
              icon="i-lucide-lock"
              size="lg"
              required
            />
          </UFormGroup>
        </div>

        <UButton type="submit" color="primary" block :loading="loading">
          Register
        </UButton>

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-medium">Login</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const auth = useAuthStore();

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
});
const loading = ref(false);
const error = ref('');

async function handleRegister() {
  loading.value = true;
  error.value = '';
  try {
    await auth.register(form);
    navigateTo('/');
  } catch (e: any) {
    error.value = e?.data?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>
