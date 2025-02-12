<style scoped src="./login.css"></style>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginUser } from "../authService";

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  try {
    const data = await loginUser(email.value, password.value);
    localStorage.setItem("token", data.token);
    router.push("/dashboard");
  } catch (error) {
    alert("Invalid credentials");
  }
};

const goToRegister = () => {
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