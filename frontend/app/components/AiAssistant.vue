<template>
  <div class="fixed bottom-4 right-4 z-[9999]">
    <UButton
      v-if="!isOpen"
      icon="i-lucide-bot"
      size="lg"
      color="primary"
      class="rounded-full shadow-lg"
      @click="isOpen = true"
    />

    <UCard v-if="isOpen" class="w-96 shadow-2xl">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bot" class="text-primary" />
            <span class="font-semibold">AI Assistant</span>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="flex-1 mb-5">
        Hey! What can I help you with today?
      </div>

      <div class="flex flex-col gap-4">
        <div ref="messagesContainer" class="flex-1 max-h-96 overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'mb-3 mr-2',
              message.role === 'user' ? 'self-end' : 'self-start'
            ]"
          >
            <div
              :class="[
                'p-3 rounded-lg max-w-full inline-block',
                message.role === 'user'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800'
              ]"
            >
              <div class="text-sm whitespace-pre-wrap">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="flex gap-2">
          <UInput
            v-model="question"
            placeholder="Ask me anything..."
            :disabled="loading"
            class="flex-1"
            autofocus
          />
          <UButton
            type="submit"
            icon="i-lucide-send"
            :loading="loading"
            :disabled="!question.trim()"
          />
        </form>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useFlightsStore } from '~/stores/flights';

const { api } = useApi();
const flightsStore = useFlightsStore();

const isOpen = ref(false);
const question = ref('');
const loading = ref(false);
const messages = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
const messagesContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

async function sendMessage() {
  if (!question.value.trim() || loading.value) return;

  const userQuestion = question.value;
  messages.value.push({ role: 'user', content: userQuestion });
  question.value = '';
  loading.value = true;

  try {
    const response = await api<any>('/ai/ask', {
      method: 'POST',
      body: { question: userQuestion },
    });

    if (response?.type === 'search' && response.data?.length > 0) {
      flightsStore.setFlights(response.data);
      messages.value.push({
        role: 'assistant',
        content: response.message || 'Flights have been loaded.',
      });
    } else {
      messages.value.push({
        role: 'assistant',
        content: response.message || 'Response received',
      });
    }
  } catch (error: any) {
    messages.value.push({
      role: 'assistant',
      content: `Error: ${error.message || 'Failed to get response'}`,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
