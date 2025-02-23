<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginUser } from "../authService";

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  console.log("Attempting to log in with:", email.value); // Log the email input
  try {
    const data = await loginUser(email.value, password.value);
    
    console.log("Login successful:", data); // Log the successful login response

    // Store the token and role in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", data.role); // Store the role

    console.log("Stored token and role:", data.token, data.role); // Log stored data

    // Check for stored redirect path
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error("Login failed:", error); // Log error in case of failure
    alert("Invalid credentials");
  }
};

const goToRegister = () => {
  console.log("Navigating to the registration page"); // Log navigation action
  router.push("/register"); // Redirect to Register Page
};
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />
    
    <button @click="login">Login</button>
    <button @click="goToRegister" class="register-btn">Register</button>
  </div>
</template>

<style scoped >.login-container {
  max-width: 300px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

input {
  margin: 5px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: blue;
  color: white;
  padding: 8px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: darkblue;
}

.register-btn {
  background: #2ecc71;
  color: white;
  margin-top: 10px;
  border: none;
  padding: 10px;
  cursor: pointer;
  width: 100%;
}

.register-btn:hover {
  background: #27ae60;
}
</style>
