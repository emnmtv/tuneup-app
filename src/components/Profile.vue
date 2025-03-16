<script setup>
import { ref, onMounted, computed } from "vue";
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

const profilePictureInput = ref(null);
const coverPhotoInput = ref(null);
const tempProfilePicture = ref(null);
const tempCoverPhoto = ref(null);

const avatarStyle = computed(() => {
  if (tempProfilePicture.value) {
    return {
      backgroundImage: `url(${tempProfilePicture.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'transparent',
    };
  }
  if (profile.value.profilePicture) {
    return {
      backgroundImage: `url(${profile.value.profilePicture})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'transparent',
    };
  }
  return {
    backgroundColor: getAvatarColor(profile.value.firstName),
    color: 'white',
  };
});

const coverPhotoStyle = computed(() => {
  if (tempCoverPhoto.value) {
    return {
      backgroundImage: `url(${tempCoverPhoto.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (profile.value.coverPhoto) {
    return {
      backgroundImage: `url(${profile.value.coverPhoto})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {
    background: 'linear-gradient(45deg, #1877F2, #2196F3)',
  };
});

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

const triggerProfilePictureUpload = () => {
  if (!isEditing.value) return;
  profilePictureInput.value.click();
};

const triggerCoverPhotoUpload = (event) => {
  if (!isEditing.value) return;
  event?.stopPropagation(); // Stop event propagation
  coverPhotoInput.value.click();
};

const handleProfilePictureChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      tempProfilePicture.value = e.target.result;
      profile.value.profilePicture = file;
    };
    reader.readAsDataURL(file);
  }
};

const handleCoverPhotoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid file type',
        text: 'Please upload an image file (JPEG, PNG, GIF, or WebP)',
      });
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'Please upload an image smaller than 5MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      tempCoverPhoto.value = e.target.result;
      profile.value.coverPhoto = file;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  try {
    loading.value = true;
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

    const updatedProfile = await updateProfile(profile.value);
    
    // Update the profile with new image URLs
    profile.value = {
      ...profile.value,
      profilePicture: updatedProfile.user.profilePicture,
      coverPhoto: updatedProfile.user.coverPhoto,
    };

    // Clear temporary preview images
    tempProfilePicture.value = null;
    tempCoverPhoto.value = null;

    await Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your profile has been successfully updated.',
      timer: 2000,
      showConfirmButton: false
    });
    
    isEditing.value = false;
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

const getAvatarColor = (name) => {
  const colors = [
    '#1877F2', '#E84C3D', '#2ECC70', '#3498DB',
    '#9B59B6', '#F1C40F', '#E67E22', '#1ABC9C'
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  return colors[charCode % colors.length];
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
  // Optionally show a fallback
  if (event.target.classList.contains('avatar')) {
    event.target.textContent = getInitials(profile.value.firstName, profile.value.lastName);
  }
};

onMounted(fetchProfile);
</script>

<template>
  <div class="profile-page">
    <!-- Cover Photo Section -->
    <div class="cover-section">
      <div class="cover-photo" 
           :style="coverPhotoStyle"
           @click="isEditing && triggerCoverPhotoUpload">
        <input
          type="file"
          ref="coverPhotoInput"
          class="hidden-input"
          accept="image/*"
          @change="handleCoverPhotoChange"
        />
        <div class="cover-overlay">
          <button v-if="isEditing" 
                  class="upload-btn"
                  @click.stop="triggerCoverPhotoUpload">
            <i class="material-icons">camera_alt</i>
            Change Cover
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Main Section -->
    <div class="profile-main">
      <!-- Profile Header with Avatar -->
      <div class="profile-header">
        <div class="avatar-container">
          <div class="avatar" 
               :style="avatarStyle"
               @error="handleImageError"
               @click="isEditing && triggerProfilePictureUpload">
            <template v-if="!profile.profilePicture && !tempProfilePicture">
              {{ getInitials(profile.firstName, profile.lastName) }}
            </template>
            <input
              type="file"
              ref="profilePictureInput"
              class="hidden-input"
              accept="image/*"
              @change="handleProfilePictureChange"
            />
          </div>
          <button v-if="isEditing" class="avatar-edit-btn" @click="triggerProfilePictureUpload">
            <i class="material-icons">camera_alt</i>
          </button>
        </div>
        
        <div class="profile-info">
          <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
          <span class="role-badge" :class="userRole.toLowerCase()">{{ userRole }}</span>
        </div>

        <button @click="toggleEdit" class="edit-profile-btn" v-if="!isEditing">
          <i class="material-icons">edit</i>
          Edit Profile
        </button>
      </div>

      <!-- Profile Content -->
      <div class="profile-content" :class="{ 'editing': isEditing }">
        <!-- View Mode -->
        <div v-if="!isEditing" class="info-cards">
          <div class="info-card">
            <h3>About</h3>
            <div class="info-item">
              <i class="material-icons">email</i>
              <div>
                <label>Email</label>
                <span>{{ profile.email }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="material-icons">phone</i>
              <div>
                <label>Phone</label>
                <span>{{ profile.phoneNumber || 'Add phone number' }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="material-icons">cake</i>
              <div>
                <label>Birthday</label>
                <span>{{ formatDate(profile.dateOfBirth) || 'Add birthday' }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="material-icons">location_on</i>
              <div>
                <label>Address</label>
                <span>{{ profile.address || 'Add address' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <transition name="fade">
          <form v-if="isEditing" @submit.prevent="saveProfile" class="edit-form">
            <div class="form-grid">
              <div class="form-group">
                <label>First Name</label>
                <div class="input-with-icon">
                  <i class="material-icons">person</i>
                  <input v-model="profile.firstName" type="text" />
                </div>
              </div>

              <div class="form-group">
                <label>Last Name</label>
                <div class="input-with-icon">
                  <i class="material-icons">person</i>
                  <input v-model="profile.lastName" type="text" />
                </div>
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <div class="input-with-icon">
                  <i class="material-icons">phone</i>
                  <input v-model="profile.phoneNumber" type="tel" />
                </div>
              </div>

              <div class="form-group">
                <label>Date of Birth</label>
                <div class="input-with-icon">
                  <i class="material-icons">cake</i>
                  <input v-model="profile.dateOfBirth" type="date" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Address</label>
                <div class="input-with-icon">
                  <i class="material-icons">location_on</i>
                  <input v-model="profile.address" type="text" />
                </div>
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
        </transition>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <transition name="toast">
      <div v-if="message" :class="['toast', messageType]">
        <i class="material-icons">{{ messageType === 'success' ? 'check_circle' : 'error' }}</i>
        {{ message }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.profile-page {
  background: #f0f2f5;
  min-height: 100vh;
}

.cover-section {
  position: relative;
  width: 100%;
  height: 350px;
  cursor: pointer;
}

.cover-photo {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  position: relative;
  transition: all 0.3s ease;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 60%,
    rgba(0, 0, 0, 0.3)
  );
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20px;
}

.profile-main {
  max-width: 940px;
  margin: -90px auto 0;
  padding: 0 16px;
  position: relative;
}

.profile-header {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
  padding: 0 16px 16px;
}

.avatar-container {
  position: relative;
  margin-right: 24px;
}

.avatar {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 6px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  background-position: center;
  background-size: cover;
  position: relative;
}

.avatar:hover {
  transform: scale(1.02);
}

.avatar:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2;
}

.avatar-edit-btn:hover {
  background: white;
  transform: scale(1.1);
}

.profile-info {
  flex: 1;
  padding-bottom: 8px;
}

.profile-info h1 {
  margin: 0 0 8px;
  font-size: 32px;
  color: #1c1e21;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.role-badge.creator {
  background: #e3f2fd;
  color: #1877F2;
}

.role-badge.user {
  background: #f5f6f7;
  color: #65676b;
}

.role-badge.admin {
  background: #fce4ec;
  color: #e91e63;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e4e6eb;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: #d8dadf;
  transform: translateY(-2px);
}

.profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.info-cards {
  padding: 16px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.info-card h3 {
  margin: 0 0 16px;
  color: #1c1e21;
  font-size: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: #1877F2;
  margin-right: 12px;
}

.info-item label {
  font-size: 13px;
  color: #65676b;
  margin-bottom: 4px;
}

.info-item span {
  display: block;
  color: #1c1e21;
}

.edit-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.input-with-icon {
  position: relative;
  margin-top: 8px;
}

.input-with-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #65676b;
}

.input-with-icon input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e4e6eb;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.input-with-icon input:focus {
  border-color: #1877F2;
  box-shadow: 0 0 0 2px rgba(24,119,242,0.2);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.save-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #1877F2;
  color: white;
}

.save-btn:hover {
  background: #166fe5;
  transform: translateY(-2px);
}

.cancel-btn {
  background: #e4e6eb;
  color: #050505;
}

.cancel-btn:hover {
  background: #d8dadf;
  transform: translateY(-2px);
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.toast.success {
  background: #43a047;
}

.toast.error {
  background: #d32f2f;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 16px;
  }

  .avatar-container {
    margin: 0 0 16px;
  }

  .profile-info {
    margin-bottom: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn, .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}

.hidden-input {
  display: none;
}

.upload-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 2;
}

.cover-photo:hover .upload-btn {
  opacity: 1;
  transform: translateY(-4px);
}

.upload-btn:hover {
  background: white;
  transform: translateY(-6px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Add these new hover effects */
.cover-photo:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  transition: all 0.3s ease;
}

.cover-photo.editing {
  cursor: pointer;
}
</style>
