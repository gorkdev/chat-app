<template>
  <div class="container mx-auto p-4">
    <client-only>
      <LoginOrChat />
    </client-only>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import LoginOrChat from "~/components/LoginOrChat.vue";

// Cleanup when page is closed
const handleBeforeUnload = () => {
  // Disconnect socket
  if (typeof window !== "undefined" && window.socket) {
    window.socket.disconnect();
  }
};

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>
