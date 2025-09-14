<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Nuxt Chat App</h1>

    <div class="border p-4 h-96 overflow-y-auto mb-4" ref="chatBox">
      <div v-for="(msg, index) in messages" :key="index" class="mb-2">
        <strong>{{ msg.username }}:</strong> {{ msg.message }}
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex">
      <input
        v-model="message"
        placeholder="Mesaj yaz..."
        class="flex-1 border p-2 mr-2"
      />
      <button type="submit" class="bg-blue-500 text-white p-2 rounded">
        Gönder
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { io } from "socket.io-client";

const messages = ref([]);
const message = ref("");
const chatBox = ref(null);

// Backend URL
const socket = io("http://localhost:5000"); // Eğer VPS ya da farklı port, burayı değiştir

onMounted(() => {
  socket.on("receive_message", (data) => {
    messages.value.push(data);

    // Scroll to bottom
    nextTick(() => {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    });
  });
});

const sendMessage = () => {
  if (message.value.trim() === "") return;

  const data = {
    username: "Guest", // daha sonra kullanıcı girişi ekleyebilirsin
    message: message.value,
    timestamp: new Date(),
  };

  socket.emit("send_message", data);
  message.value = "";
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
