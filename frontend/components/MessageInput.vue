<template>
  <form @submit.prevent="send" class="flex items-end space-x-3">
    <div class="flex-1 relative">
      <input
        v-model="message"
        placeholder="Type your message..."
        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
        rows="1"
        @keydown.enter.prevent="send"
        @input="adjustHeight"
        ref="inputRef"
      />
      <button
        type="button"
        @click="message = ''"
        v-if="message"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
    <button
      type="submit"
      :disabled="!message.trim()"
      class="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        ></path>
      </svg>
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { defineEmits } from "vue";

const emits = defineEmits(["sendMessage"]);
const message = ref("");
const inputRef = ref(null);

const send = () => {
  if (message.value.trim() === "") return;
  emits("sendMessage", message.value.trim());
  message.value = "";
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

const adjustHeight = () => {
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
    inputRef.value.style.height = inputRef.value.scrollHeight + "px";
  }
};
</script>
