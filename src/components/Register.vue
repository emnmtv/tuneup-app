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
const showPassword = ref(false);

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
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Join the TuneUp community today</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>
            <i class="material-icons">email</i>
            Email
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label>
            <i class="material-icons">lock</i>
            Password
          </label>
          <div class="password-input">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="Enter your password"
            />
            <i 
              class="material-icons toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </i>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <i class="material-icons">person</i>
              First Name
            </label>
            <input 
              v-model="form.firstName" 
              type="text" 
              required 
              placeholder="First name"
            />
          </div>

          <div class="form-group">
            <label>
              <i class="material-icons">person</i>
              Last Name
            </label>
            <input 
              v-model="form.lastName" 
              type="text" 
              required 
              placeholder="Last name"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <i class="material-icons">phone</i>
              Phone Number
            </label>
            <input 
              v-model="form.phoneNumber" 
              type="tel" 
              placeholder="Phone number"
            />
          </div>

          <div class="form-group">
            <label>
              <i class="material-icons">cake</i>
              Date of Birth
            </label>
            <input 
              v-model="form.dateOfBirth" 
              type="date" 
              required
            />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Create Account</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account?</p>
        <button @click="$router.push('/login')" class="switch-btn">
          Sign In
        </button>
      </div>
    </div>

    <div class="auth-banner">
      <div class="banner-content">
        <h2>TuneUp</h2>
        <p>Where talent meets opportunity</p>
      </div>
      <div class="banner-overlay"></div>
      <img :src="images[currentIndex]" alt="Music" class="banner-image" />
    </div>

    <!-- Verification Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Verify Your Email</h3>
        <p>Please enter the verification code sent to your email</p>
        <div class="verification-input">
          <input 
            v-model="verificationCode" 
            type="text" 
            placeholder="Enter code"
            maxlength="6"
          />
        </div>
        <div class="modal-actions">
          <button @click="handleVerify" class="verify-btn" :disabled="loading">
            <span v-if="!loading">Verify</span>
            <div v-else class="loader"></div>
          </button>
          <button @click="showModal = false" class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.auth-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
  font-size: 1.1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.submit-btn {
  background: #2196f3;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background: #1976d2;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.verification-input {
  margin: 1.5rem 0;
}

.verification-input input {
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.verify-btn, .cancel-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.verify-btn {
  background: #2196f3;
  color: white;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

/* Banner Styles */
.auth-banner {
  flex: 1;
  position: relative;
  display: none;
  overflow: hidden;
}

.banner-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 1s;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.8), rgba(21, 101, 192, 0.8));
  z-index: 1;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 2;
}

@media (min-width: 1024px) {
  .auth-banner {
    display: block;
  }
}

@media (max-width: 768px) {
  .auth-content {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
  }
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
  margin: 0 auto;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
