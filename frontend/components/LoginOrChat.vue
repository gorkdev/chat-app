<template>
  <div>
    <LoginForm
      v-if="!username"
      ref="loginFormRef"
      :loading="isLoggingIn"
      @auth="handleAuth"
      @checkUsername="handleCheckUsername"
    />
    <div v-else class="min-h-screen">
      <!-- Header -->
      <div class="bg-white">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
              >
                {{ username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">
                  Welcome, {{ username }}
                </h1>
                <p class="text-sm text-gray-600">You're now in the chat</p>
              </div>
            </div>
            <button
              @click="logout"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg
                class="w-4 h-4 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Online Users Sidebar -->
          <div class="lg:col-span-1">
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <h3 class="text-sm font-semibold text-gray-700 mb-3">
                Online Users
              </h3>
              <div class="space-y-2">
                <div
                  v-for="user in onlineUsers"
                  :key="user.username"
                  class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  >
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm text-gray-700">{{ user.username }}</span>
                </div>
                <div
                  v-if="onlineUsers.length === 0"
                  class="text-sm text-gray-500 text-center py-4"
                >
                  No users online
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Container -->
          <div class="lg:col-span-3">
            <!-- System Messages -->
            <div v-if="systemMessages.length > 0" class="mb-4 space-y-2">
              <div
                v-for="(msg, index) in systemMessages"
                :key="index"
                class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
              >
                <div class="flex items-center">
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {{ msg }}
                </div>
              </div>
            </div>

            <!-- Chat Container -->
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <!-- Chat Box -->
              <div class="h-96">
                <ChatBox
                  :messages="messages"
                  :currentUser="username"
                  :hasMoreMessages="hasMoreMessages"
                  :loadingMessages="loadingMessages"
                  @loadMore="loadMoreMessages"
                />
              </div>

              <!-- Message Input -->
              <div class="p-4 bg-gray-50 border-t border-gray-200">
                <MessageInput @sendMessage="handleSendMessage" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

import LoginForm from "./LoginForm.vue";
import ChatBox from "./ChatBox.vue";
import MessageInput from "./MessageInput.vue";

const username = ref("");
const messages = ref([]);
const systemMessages = ref([]);
const isLoggingIn = ref(false);
const loginFormRef = ref(null);
const loadingMessages = ref(false);
const hasMoreMessages = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const onlineUsers = ref([]);
let socket;

// Username check
const handleCheckUsername = (username) => {
  if (!socket) return;
  socket.emit("check_username", { username });
};

// Auth (login/register)
const handleAuth = (data) => {
  if (!socket) return;

  isLoggingIn.value = true;
  socket.emit("user_auth", data);
};

// Load messages from server
const loadMessages = async (page = 1, prepend = false) => {
  try {
    loadingMessages.value = true;
    const response = await fetch(
      `http://localhost:5000/api/messages?page=${page}&limit=20`
    );
    const data = await response.json();

    if (prepend) {
      // Prepend old messages
      messages.value = [...data.messages, ...messages.value];
    } else {
      // Initial load
      messages.value = data.messages;
    }

    currentPage.value = data.pagination.currentPage;
    totalPages.value = data.pagination.totalPages;
    hasMoreMessages.value = data.pagination.hasNext;
  } catch (err) {
    console.error("Error loading messages:", err);
  } finally {
    loadingMessages.value = false;
  }
};

// Load more messages
const loadMoreMessages = () => {
  if (hasMoreMessages.value && !loadingMessages.value) {
    loadMessages(currentPage.value + 1, true);
  }
};

// Load online users
const loadOnlineUsers = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/users/online");
    const data = await response.json();
    onlineUsers.value = data.users;
  } catch (err) {
    console.error("Error loading online users:", err);
  }
};

// Logout
const logout = () => {
  username.value = "";
  messages.value = [];
  systemMessages.value = [];
  currentPage.value = 1;
  totalPages.value = 1;
  hasMoreMessages.value = true;

  // Clear localStorage
  localStorage.removeItem("chatUsername");

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Cleanup on component unmount
onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

const handleSendMessage = (msg) => {
  if (!socket) return;
  const data = {
    username: username.value,
    message: msg,
    timestamp: new Date(),
  };
  socket.emit("send_message", data);
};

onMounted(() => {
  socket = io("http://localhost:5000");

  // Make socket globally accessible
  if (typeof window !== "undefined") {
    window.socket = socket;
  }

  // Check if user was previously logged in
  const savedUsername = localStorage.getItem("chatUsername");
  if (savedUsername) {
    username.value = savedUsername;
    // Load messages and users for returning user
    loadMessages();
    loadOnlineUsers();

    // Notify server that user is back online
    socket.emit("user_reconnect", { username: savedUsername });
  }

  // Receive messages
  socket.on("receive_message", (data) => {
    messages.value.push(data);
  });

  // Username check results
  socket.on("username_exists", (data) => {
    if (loginFormRef.value) {
      loginFormRef.value.handleUsernameExists(data);
    }
  });

  socket.on("username_available", (data) => {
    if (loginFormRef.value) {
      loginFormRef.value.handleUsernameAvailable(data);
    }
  });

  socket.on("username_check_error", (data) => {
    if (loginFormRef.value) {
      loginFormRef.value.handleAuthError(data);
    }
  });

  // Auth results
  socket.on("auth_success", async (data) => {
    username.value = data.username;
    isLoggingIn.value = false;

    const message = `${data.username} joined the chat.`;
    systemMessages.value.push(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      const index = systemMessages.value.indexOf(message);
      if (index > -1) {
        systemMessages.value.splice(index, 1);
      }
    }, 3000);

    // Save username to localStorage
    localStorage.setItem("chatUsername", data.username);

    // Load messages and users
    await Promise.all([loadMessages(), loadOnlineUsers()]);

    if (loginFormRef.value) {
      loginFormRef.value.handleAuthSuccess();
    }
  });

  socket.on("auth_error", (data) => {
    isLoggingIn.value = false;
    console.error("Auth error:", data);

    if (loginFormRef.value) {
      loginFormRef.value.handleAuthError(data);
    }
  });

  // User joined
  socket.on("user_joined", (data) => {
    if (data.username !== username.value) {
      const message = `${data.username} joined the chat.`;
      systemMessages.value.push(message);

      // Remove message after 3 seconds
      setTimeout(() => {
        const index = systemMessages.value.indexOf(message);
        if (index > -1) {
          systemMessages.value.splice(index, 1);
        }
      }, 3000);
    }
    // Refresh online users list
    loadOnlineUsers();
  });

  // User left
  socket.on("user_left", (data) => {
    if (data.username !== username.value) {
      const message = `${data.username} left the chat.`;
      systemMessages.value.push(message);

      // Remove message after 3 seconds
      setTimeout(() => {
        const index = systemMessages.value.indexOf(message);
        if (index > -1) {
          systemMessages.value.splice(index, 1);
        }
      }, 3000);
    }
    // Refresh online users list
    loadOnlineUsers();
  });
});
</script>
