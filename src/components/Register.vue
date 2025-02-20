<script setup>
import { ref, onMounted } from "vue";
import { registerUser, verifyEmail, loginUser } from "../authService";
import Swal from 'sweetalert2'; // Import SweetAlert2

const form = ref({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  dateOfBirth: "",
});

const verificationCode = ref("");
const showModal = ref(false);
const loading = ref(false);

const images = [
  require('@/assets/slash.jpg'),
  require('@/assets/mini.jpg'),
  require('@/assets/microphone.jpg'),
  require('@/assets/electric.jpg')
];

const currentIndex = ref(0);

onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length;
  }, 3000); // Change image every 3 seconds
});

const handleRegister = async () => {
  try {
    loading.value = true;

    await registerUser(form.value);
    Swal.fire({
      title: 'Success!',
      text: 'Registration successful! Check your email for a verification code.',
      icon: 'success',
      confirmButtonText: 'OK'
    });

    showModal.value = true; // Show the verification modal
  } catch (error) {
    console.error("Registration failed:", error);
    Swal.fire({
      title: 'Error!',
      text: 'Registration failed. Try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    loading.value = false;
  }
};

const handleVerify = async () => {
  try {
    loading.value = true;

    await verifyEmail(form.value.email, verificationCode.value); // Verify email

    // Auto-login after successful verification
    const loginResponse = await loginUser(form.value.email, form.value.password);
    localStorage.setItem("token", loginResponse.token); // Store the token

    Swal.fire({
      title: 'Success!',
      text: 'Email verified and logged in successfully!',
      icon: 'success',
      confirmButtonText: 'OK'
    });

    showModal.value = false; // Hide modal
    window.location.href = "/dashboard"; // Redirect to dashboard or home
  } catch (error) {
    console.error("Verification failed:", error);
    Swal.fire({
      title: 'Error!',
      text: 'Invalid verification code.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <h2>welcome to tuneup </h2>
    <p>Hiring musicians has never been easier</p>

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

      <label>Date of Birth:</label>
      <input v-model="form.dateOfBirth" type="date" required />

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
  <div class="slideshow">
    <img v-for="(image, index) in images" :key="index" :src="image" :class="{ active: currentIndex === index }" />
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

.register-container {
  position: absolute; /* Change to absolute for positioning */
  top: 50%; /* Center vertically */
  right: 30%; /* Position to the right */
  transform: translateY(-50%); /* Adjust for vertical centering */
  z-index: 2; /* Ensure form is above the slideshow */
  width: 400px; /* Fixed width */
  height: 600px; /* Increased height */
  padding: 20px; /* Padding for spacing */
  background: rgba(255, 255, 255, 0.9); /* Slightly more opaque background */
  border-radius: 15px; /* Rounded corners */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Deeper shadow for depth */
  font-family: 'Arial', sans-serif; /* Modern font */
  overflow: hidden; /* Remove scrolling */
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  justify-content: space-between; /* Space out elements */
}

h2 {
  text-align: center; /* Center the heading */
  color: #333; /* Darker text color */
}

label {
  font-weight: bold; /* Bold labels */
  margin-top: 10px; /* Spacing above labels */
}

input {
  display: block;
  width: 100%;
  padding: 10px; /* Padding inside the input */
  margin-bottom: 15px; /* Space between inputs */
  border: 1px solid #ccc; /* Light border */
  border-radius: 5px; /* Rounded input corners */
  transition: border-color 0.3s; /* Smooth transition for focus */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

input:focus {
  border-color: #3498db; /* Highlight border on focus */
  outline: none; /* Remove default outline */
}

button {
  background: #3498db; /* Button color */
  color: white;
  border: none;
  padding: 12px; /* Increased padding for buttons */
  border-radius: 5px; /* Rounded button corners */
  cursor: pointer;
  width: 100%; /* Full width button */
  transition: background 0.3s; /* Smooth transition for hover */
}

button:hover {
  background: #2980b9; /* Darker button on hover */
}

.message {
  color: green;
  font-weight: bold;
  text-align: center; /* Center message */
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

.slideshow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1; /* Behind the form */
}

.slideshow img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.slideshow img.active {
  opacity: 1;
}

/* Media Queries for Mobile View */
@media (max-width: 600px) {
  .register-container {
    right: 5%; /* Adjust position for mobile */
    left: 5%; /* Ensure it doesn't overflow */
    width: auto; /* Auto width to fit content */
    height: auto; /* Auto height to fit content */
    padding: 20px; /* Adjust padding for better spacing */
    box-shadow: none; /* Remove shadow for a cleaner look */
  }

  h2 {
    font-size: 1.8em; /* Increase heading size for better visibility */
    margin-bottom: 10px; /* Add space below heading */
  }

  p {
    font-size: 1em; /* Adjust paragraph size */
    margin-bottom: 15px; /* Space below paragraph */
  }

  label {
    font-size: 1em; /* Adjust label size */
    margin-top: 15px; /* More space above labels */
  }

  input {
    padding: 12px; /* Increase input padding for comfort */
    margin-bottom: 15px; /* Space between inputs */
    border: 1px solid rgba(255, 255, 255, 0.5); /* Light border with transparency */
    border-radius: 8px; /* Slightly larger rounded corners */
  }

  button {
    padding: 15px; /* Increase button padding for easier tapping */
    font-size: 1em; /* Adjust button font size */
  }
}
</style>
