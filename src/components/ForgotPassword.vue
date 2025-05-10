<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from 'sweetalert2';
import { requestPasswordReset, resetPassword as resetPasswordService } from "../authService";

const router = useRouter();
const step = ref(1); // 1 = Enter email, 2 = Enter code + new password
const email = ref("");
const resetCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const showPassword = ref(false);

const requestReset = async () => {
  if (!email.value) {
    Swal.fire({
      icon: 'error',
      title: 'Email Required',
      text: 'Please enter your email address',
    });
    return;
  }

  try {
    loading.value = true;
    await requestPasswordReset(email.value);
    
    step.value = 2; // Move to next step
    Swal.fire({
      icon: 'info',
      title: 'Check Your Email',
      text: 'We\'ve sent a password reset code to your email. It will expire in 15 minutes.',
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Reset Request Failed',
      text: error.message || 'Something went wrong, please try again',
    });
  } finally {
    loading.value = false;
  }
};

const resetPassword = async () => {
  // Validate input
  if (!resetCode.value || !newPassword.value || !confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'All Fields Required',
      text: 'Please fill in all fields',
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'Passwords Don\'t Match',
      text: 'New password and confirmation must match',
    });
    return;
  }

  if (newPassword.value.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Password Too Short',
      text: 'Password must be at least 6 characters long',
    });
    return;
  }

  try {
    loading.value = true;
    await resetPasswordService(email.value, resetCode.value, newPassword.value);
    
    await Swal.fire({
      icon: 'success',
      title: 'Password Reset Successful',
      text: 'Your password has been reset. You can now log in with your new password.',
    });
    router.push('/login');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Reset Failed',
      text: error.message || 'Something went wrong, please try again',
    });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (step.value === 2) {
    step.value = 1;
  } else {
    router.push('/login');
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <h1>{{ step === 1 ? 'Forgot Password' : 'Reset Password' }}</h1>
        <p>{{ step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email' }}</p>
      </div>

      <!-- Step 1: Enter Email -->
      <form v-if="step === 1" @submit.prevent="requestReset" class="auth-form">
        <div class="form-group">
          <label>
            <i class="material-icons">email</i>
            Email
          </label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="Enter your email"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Send Reset Code</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <!-- Step 2: Enter Code and New Password -->
      <form v-else @submit.prevent="resetPassword" class="auth-form">
        <div class="form-group">
          <label>
            <i class="material-icons">pin</i>
            Reset Code
          </label>
          <input 
            v-model="resetCode" 
            type="text" 
            required 
            placeholder="Enter 6-digit code"
            maxlength="6"
          />
        </div>

        <div class="form-group">
          <label>
            <i class="material-icons">lock</i>
            New Password
          </label>
          <div class="password-input">
            <input 
              v-model="newPassword" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="Enter new password"
            />
            <i 
              class="material-icons toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </i>
          </div>
        </div>

        <div class="form-group">
          <label>
            <i class="material-icons">lock_outline</i>
            Confirm Password
          </label>
          <input 
            v-model="confirmPassword" 
            :type="showPassword ? 'text' : 'password'" 
            required 
            placeholder="Confirm new password"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Reset Password</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="auth-footer">
        <button @click="goBack" class="back-btn">
          <i class="material-icons">arrow_back</i>
          {{ step === 1 ? 'Back to Login' : 'Back to Email Entry' }}
        </button>
      </div>
    </div>

    <div class="auth-banner">
      <div class="banner-content">
        <h2>TuneUp</h2>
        <p>Where talent meets opportunity</p>
      </div>
      <div class="banner-overlay"></div>
      <img :src="require('@/assets/microphone.jpg')" alt="Music" class="banner-image" />
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
  max-width: 500px;
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

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  transition: all 0.3s;
  margin: 0 auto;
}

.back-btn:hover {
  color: #333;
}

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

.banner-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
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

@media (min-width: 1024px) {
  .auth-banner {
    display: block;
  }
}

@media (max-width: 768px) {
  .auth-content {
    padding: 1rem;
  }

  .auth-header h1 {
    font-size: 2rem;
  }
}
</style> 