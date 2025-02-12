<script setup>
import { ref } from "vue";
import { registerUser, verifyEmail, loginUser } from "../authService";

const form = ref({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
});

const verificationCode = ref("");
const showModal = ref(false);
const loading = ref(false);
const message = ref("");

const handleRegister = async () => {
  try {
    loading.value = true;
    message.value = "";

    await registerUser(form.value);
    message.value = "Registration successful! Check your email for a verification code.";

    showModal.value = true; // Show the verification modal
  } catch (error) {
    console.error("Registration failed:", error);
    message.value = "Registration failed. Try again.";
  } finally {
    loading.value = false;
  }
};

const handleVerify = async () => {
  try {
    loading.value = true;
    message.value = "";

    await verifyEmail(form.value.email, verificationCode.value); // Verify email

    // Auto-login after successful verification
    const loginResponse = await loginUser(form.value.email, form.value.password);
    localStorage.setItem("token", loginResponse.token); // Store the token

    message.value = "Email verified and logged in successfully!";
    showModal.value = false; // Hide modal

    window.location.href = "/dashboard"; // Redirect to dashboard or home
  } catch (error) {
    console.error("Verification failed:", error);
    message.value = "Invalid verification code.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <h2>Register</h2>
    <p v-if="message" class="message">{{ message }}</p>

    <form @submit.prevent="handleRegister">
      <label>Email:</label>
      <input v-model="form.email" type="email" required />

      <label>Password:</label>
      <input v-model="form.password" type="password" required />

      <label>First Name:</label>
      <input v-model="form.firstName" type="text" />

      <label>Last Name:</label>
      <input v-model="form.lastName" type="text" />

      <label>Phone Number:</label>
      <input v-model="form.phoneNumber" type="tel" />

      <button type="submit" :disabled="loading">
        {{ loading ? "Registering..." : "Register" }}
      </button>
    </form>

    <!-- Verification Code Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Enter Verification Code</h3>
        <input v-model="verificationCode" type="text" placeholder="Enter code" />
        <button @click="handleVerify">Verify</button>
        <button @click="showModal = false" class="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>


<style>
.register-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

button:hover {
  background: #2980b9;
}

.message {
  color: green;
  font-weight: bold;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.cancel {
  background: #e74c3c;
}
</style>
