<template>
  <div class="min-h-screen w-full flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-lg mb-6 shadow-lg"
        >
          <svg
            class="w-8 h-8 text-white"
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
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Chat App</h1>
        <p class="text-gray-600">Join the conversation or create an account</p>
      </div>

      <!-- Auth Form -->
      <div class="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <input
                v-model="username"
                type="text"
                placeholder="Enter your username"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                :disabled="loading"
                @blur="checkUsername"
                required
              />
              <div
                v-if="checkingUsername"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div
                  class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"
                ></div>
              </div>
            </div>
          </div>

          <!-- Password Input -->
          <div v-if="showPasswordField">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ isExistingUser ? "Password" : "Create Password" }}
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="
                  isExistingUser
                    ? 'Enter your password'
                    : 'At least 6 characters'
                "
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200 pr-12"
                :disabled="loading"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Status Message -->
          <div
            v-if="statusMessage"
            class="p-4 rounded-lg border"
            :class="
              statusMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : statusMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            "
          >
            <div class="flex items-center">
              <svg
                v-if="statusMessage.type === 'error'"
                class="w-5 h-5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <svg
                v-else-if="statusMessage.type === 'success'"
                class="w-5 h-5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-sm font-medium">{{ statusMessage.text }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="
              loading ||
              !username.trim() ||
              (showPasswordField && !password.trim())
            "
            class="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <div
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
              ></div>
              {{ isExistingUser ? "Signing in..." : "Creating account..." }}
            </span>
            <span v-else>
              {{ isExistingUser ? "Sign In" : "Create Account" }}
            </span>
          </button>
        </form>

        <!-- Help Text -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p v-if="!showPasswordField">
            Enter your username, the system will check automatically
          </p>
          <p v-else-if="isExistingUser">Sign in with your existing account</p>
          <p v-else>Create a new account</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { defineEmits } from "vue";

const props = defineProps({
  error: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["auth", "checkUsername"]);

// Reactive data
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const showPasswordField = ref(false);
const isExistingUser = ref(false);
const checkingUsername = ref(false);
const statusMessage = ref(null);

// Username check
const checkUsername = async () => {
  if (!username.value.trim() || checkingUsername.value) return;

  checkingUsername.value = true;
  statusMessage.value = null;

  // Emit to parent component for username check
  emits("checkUsername", username.value.trim());
};

// Form submit
const handleSubmit = () => {
  if (!username.value.trim() || !password.value.trim() || props.loading) return;

  // Password validation
  if (password.value.length < 6) {
    statusMessage.value = {
      type: "error",
      text: "Password must be at least 6 characters!",
    };
    return;
  }

  const action = isExistingUser.value ? "login" : "register";
  emits("auth", {
    username: username.value.trim(),
    password: password.value,
    action: action,
  });
};

// Parent'tan gelen event'leri dinle
const handleUsernameExists = (data) => {
  checkingUsername.value = false;
  isExistingUser.value = data.exists;
  showPasswordField.value = true;
  statusMessage.value = {
    type: "info",
    text: data.message,
  };
};

const handleUsernameAvailable = (data) => {
  checkingUsername.value = false;
  isExistingUser.value = false;
  showPasswordField.value = true;
  statusMessage.value = {
    type: "info",
    text: data.message,
  };
};

const handleAuthError = (data) => {
  statusMessage.value = {
    type: "error",
    text: data.message,
  };

  if (!data.needPassword) {
    showPasswordField.value = false;
    isExistingUser.value = false;
  }
};

const handleAuthSuccess = () => {
  statusMessage.value = {
    type: "success",
    text: "Success!",
  };
};

// Parent component'e event'leri expose et
defineExpose({
  handleUsernameExists,
  handleUsernameAvailable,
  handleAuthError,
  handleAuthSuccess,
});
</script>
