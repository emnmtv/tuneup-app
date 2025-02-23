<script setup>
import { ref, onMounted } from "vue";
import { getProfile, updateProfile } from "../authService";
import Swal from "sweetalert2";

const profile = ref({
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  dateOfBirth: "",
});

const isEditing = ref(false);
const loading = ref(false);
const message = ref("");
const messageType = ref("success");
const userRole = ref(localStorage.getItem('userRole') || 'User');
const originalProfile = ref(null);

const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchProfile = async () => {
  try {
    loading.value = true;
    const data = await getProfile();
    profile.value = data.userProfile;
    originalProfile.value = { ...data.userProfile };
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    showMessage("Failed to load profile.", "error");
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  try {
    // First ask for confirmation
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update your profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2196f3',
      cancelButtonColor: '#666'
    });

    if (!result.isConfirmed) {
      return;
    }

    loading.value = true;
    await updateProfile(profile.value);
    await Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your profile has been successfully updated.',
      timer: 2000,
      showConfirmButton: false
    });
    isEditing.value = false;
    originalProfile.value = { ...profile.value };
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message || 'Failed to update profile',
    });
  } finally {
    loading.value = false;
  }
};

const toggleEdit = () => {
  isEditing.value = true;
};

const cancelEdit = async () => {
  // Ask for confirmation if there are unsaved changes
  const hasChanges = JSON.stringify(profile.value) !== JSON.stringify(originalProfile.value);
  
  if (hasChanges) {
    const result = await Swal.fire({
      title: 'Discard Changes?',
      text: 'You have unsaved changes. Are you sure you want to discard them?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, discard',
      cancelButtonText: 'No, keep editing',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#666'
    });

    if (!result.isConfirmed) {
      return;
    }
  }

  isEditing.value = false;
  fetchProfile(); // Reset to original values
};

onMounted(fetchProfile);
</script>

<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">
            {{ getInitials(profile.firstName, profile.lastName) }}
          </div>
          <div class="user-info">
            <h2>{{ profile.firstName }} {{ profile.lastName || 'Your Name' }}</h2>
            <span class="role-badge">{{ userRole }}</span>
          </div>
        </div>
        <button @click="toggleEdit" class="edit-btn" v-if="!isEditing">
          <i class="material-icons">edit</i>
          Edit Profile
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" :class="['message', messageType]">
        <i class="material-icons">{{ messageType === 'success' ? 'check_circle' : 'error' }}</i>
        {{ message }}
      </div>

      <!-- Profile Content -->
      <div class="profile-content">
        <!-- View Mode -->
        <div v-if="!isEditing" class="profile-details">
          <div class="detail-group">
            <div class="detail-item">
              <i class="material-icons">email</i>
              <div class="detail-text">
                <label>Email</label>
                <span>{{ profile.email }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="material-icons">phone</i>
              <div class="detail-text">
                <label>Phone Number</label>
                <span>{{ profile.phoneNumber || 'Not provided' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="material-icons">location_on</i>
              <div class="detail-text">
                <label>Address</label>
                <span>{{ profile.address || 'Not provided' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <i class="material-icons">cake</i>
              <div class="detail-text">
                <label>Date of Birth</label>
                <span>{{ formatDate(profile.dateOfBirth) || 'Not provided' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="saveProfile" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>
                <i class="material-icons">person</i>
                First Name
              </label>
              <input 
                v-model="profile.firstName" 
                type="text" 
                placeholder="Enter your first name"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="material-icons">person</i>
                Last Name
              </label>
              <input 
                v-model="profile.lastName" 
                type="text" 
                placeholder="Enter your last name"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="material-icons">phone</i>
                Phone Number
              </label>
              <input 
                v-model="profile.phoneNumber" 
                type="tel" 
                placeholder="Enter your phone number"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="material-icons">location_on</i>
                Address
              </label>
              <input 
                v-model="profile.address" 
                type="text" 
                placeholder="Enter your address"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="material-icons">cake</i>
                Date of Birth
              </label>
              <input 
                v-model="profile.dateOfBirth" 
                type="date"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="cancel-btn">
              <i class="material-icons">close</i>
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="loading">
              <i class="material-icons">save</i>
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  background: white;
  color: #2196f3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.user-info h2 {
  margin: 0;
  font-size: 1.8rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
}

.message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background: #ffebee;
  color: #c62828;
}

.profile-content {
  padding: 2rem;
}

.detail-group {
  display: grid;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item i {
  color: #2196f3;
}

.detail-text {
  display: flex;
  flex-direction: column;
}

.detail-text label {
  font-size: 0.9rem;
  color: #666;
}

.detail-text span {
  font-size: 1.1rem;
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  color: #666;
}

.form-group input {
  padding: 0.75rem;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.edit-btn, .save-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.edit-btn:hover, .save-btn:hover {
  transform: translateY(-2px);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .avatar-section {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .edit-btn, .save-btn, .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
