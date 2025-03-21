<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { loginUser, loginWithGoogle } from "../authService";
import Swal from 'sweetalert2';

const email = ref("");
const password = ref("");
const router = useRouter();
const loading = ref(false);
const showPassword = ref(false);
const currentImageIndex = ref(0);

const images = [
  require('@/assets/slash.jpg'),
  require('@/assets/mini.jpg'),
  require('@/assets/microphone.jpg'),
  require('@/assets/electric.jpg')
];

const currentImage = ref(images[0]);
let imageInterval; // Add this to store the interval reference

const rotateImages = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
  currentImage.value = images[currentImageIndex.value];
};

onMounted(() => {
  // Start the image rotation
  imageInterval = setInterval(rotateImages, 5000); // Change image every 5 seconds
});

onUnmounted(() => {
  // Clean up the interval when component is unmounted
  if (imageInterval) {
    clearInterval(imageInterval);
  }
});

const login = async () => {
  console.log("Attempting to log in with:", email.value); // Log the email input
  try {
    loading.value = true;
    const data = await loginUser(email.value, password.value);
    
    console.log("Login successful:", data); // Log the successful login response

    // Store the token and role in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", data.role); // Store the role

    console.log("Stored token and role:", data.token, data.role); // Log stored data

    await Swal.fire({
      icon: 'success',
      title: 'Welcome back!',
      text: 'Successfully logged in',
      timer: 1500,
      showConfirmButton: false
    });

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
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Invalid credentials. Please try again.',
    });
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  console.log("Navigating to the registration page"); // Log navigation action
  router.push("/register"); // Redirect to Register Page
};

const handleGoogleLogin = async () => {
  try {
    loading.value = true;
    const auth2 = await window.google.accounts.oauth2.initTokenClient({
      client_id: '376733759979-q3p24tlbkr4mjurueprliur0sco65s4u.apps.googleusercontent.com', // Replace with your client ID
      scope: 'email profile',
      callback: async (response) => {
        if (response.access_token) {
          try {
            const data = await loginWithGoogle(response.access_token);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.role);

            await Swal.fire({
              icon: 'success',
              title: 'Welcome!',
              text: 'Successfully logged in with Google',
              timer: 1500,
              showConfirmButton: false
            });

            router.push('/dashboard');
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'Failed to login with Google. Please try again.',
            });
          }
        }
      },
    });
    auth2.requestAccessToken();
  } catch (error) {
    console.error("Google login error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Failed to initialize Google login. Please try again.',
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
        <h1>Welcome Back!</h1>
        <p>Sign in to continue your musical journey</p>
      </div>

      <form @submit.prevent="login" class="auth-form">
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

        <div class="form-group">
          <label>
            <i class="material-icons">lock</i>
            Password
          </label>
          <div class="password-input">
            <input 
              v-model="password" 
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

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Sign In</span>
          <div v-else class="loader"></div>
        </button>

        <div class="social-login">
          <div class="divider">
            <span>or</span>
          </div>
          <button type="button" class="google-btn" @click="handleGoogleLogin">
            <img src="@/assets/google.png" alt="Google" />
            Continue with Google
          </button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Don't have an account?</p>
        <button @click="goToRegister" class="switch-btn">
          Create Account
        </button>
      </div>
    </div>

    <div class="auth-banner">
      <div class="banner-content">
        <h2>TuneUp</h2>
        <p>Where talent meets opportunity</p>
      </div>
      <div class="banner-overlay"></div>
      <img :src="currentImage" alt="Music" class="banner-image" />
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

.switch-btn {
  background: none;
  border: none;
  color: #2196f3;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  transition: all 0.3s;
}

.switch-btn:hover {
  color: #1976d2;
  text-decoration: underline;
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

.social-login {
  margin-top: 2rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.google-btn:hover {
  background: #f8f9fa;
  border-color: #aaa;
}

.google-btn img {
  width: 20px;
  height: 20px;
}
</style>
