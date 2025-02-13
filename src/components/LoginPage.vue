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

    // Redirect based on role
    if (data.role === "user") {
      console.log("Redirecting to user dashboard"); // Log redirect action
      router.push("/dashboard");
    } else if (data.role === "creator") {
      console.log("Redirecting to creator dashboard"); // Log redirect action
      router.push("/dashboard");
    } else if (data.role === "admin") {
      console.log("Redirecting to admin dashboard"); // Log redirect action
      router.push("/admin-dashboard");
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

<style scoped src="./login.css"></style>
