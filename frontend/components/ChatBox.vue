<template>
  <div class="h-96 overflow-y-auto p-4 space-y-3" ref="chatBox">
    <!-- Load More Button -->
    <div v-if="hasMoreMessages" class="text-center mb-4">
      <button
        @click="loadMoreMessages"
        :disabled="loadingMessages"
        class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <span v-if="loadingMessages">Loading...</span>
        <span v-else>Load More Messages</span>
      </button>
    </div>

    <div
      v-for="(msg, index) in messages"
      :key="msg._id || index"
      class="flex"
      :class="msg.username === currentUser ? 'justify-end' : 'justify-start'"
    >
      <!-- Other user's message -->
      <div
        v-if="msg.username !== currentUser"
        class="flex items-start space-x-3 max-w-md"
      >
        <!-- Avatar -->
        <div
          class="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium"
        >
          {{ msg.username.charAt(0).toUpperCase() }}
        </div>
        <!-- Message bubble -->
        <div
          class="bg-white border border-gray-200 rounded-lg rounded-tl-sm px-4 py-3 shadow-sm"
        >
          <div class="text-xs text-gray-500 mb-1 font-medium">
            {{ msg.username }}
          </div>
          <div class="text-gray-800 text-sm leading-relaxed">
            {{ msg.message }}
          </div>
          <div class="text-xs text-gray-400 mt-2">
            {{ formatTime(msg.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Current user's message -->
      <div v-else class="flex items-start space-x-3 max-w-md flex-row-reverse">
        <!-- Message bubble -->
        <div
          class="bg-blue-500 text-white rounded-lg rounded-tr-sm px-4 py-3 shadow-sm"
        >
          <div class="text-sm leading-relaxed">{{ msg.message }}</div>
          <div class="text-xs text-blue-100 mt-2">
            {{ formatTime(msg.timestamp) }}
          </div>
        </div>
        <!-- Avatar -->
        <div
          class="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
        >
          {{ msg.username.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="flex items-center justify-center h-full"
    >
      <div class="text-center text-gray-500">
        <svg
          class="w-12 h-12 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          ></path>
        </svg>
        <p class="text-lg font-medium">Welcome to the chat!</p>
        <p class="text-sm">Send your first message</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  currentUser: {
    type: String,
    required: true,
  },
  hasMoreMessages: {
    type: Boolean,
    default: false,
  },
  loadingMessages: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["loadMore"]);

const chatBox = ref(null);

// Load more messages
const loadMoreMessages = () => {
  emits("loadMore");
};

// Auto scroll to bottom when messages change
watch(
  () => props.messages,
  async () => {
    await nextTick();
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    }
  },
  { deep: true }
);

// Time format
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
