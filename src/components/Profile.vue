<script setup>
import { ref, onMounted } from "vue";
import { getProfile, updateProfile } from "../authService";

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

const fetchProfile = async () => {
  try {
    loading.value = true;
    const data = await getProfile();
    console.log("Profile Data from API:", data);

    // ✅ Access the userProfile object correctly
    profile.value = data.userProfile; 
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    message.value = "Failed to load profile.";
  } finally {
    loading.value = false;
  }
};



const saveProfile = async () => {
  try {
    loading.value = true;
    await updateProfile(profile.value);
    message.value = "Profile updated successfully!";
    isEditing.value = false;
  } catch (error) {
    console.error(error);
    message.value = "Failed to update profile.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProfile);
</script>

<template>
  <div class="profile-container">
    <h2>User Profile</h2>
    <p v-if="message" class="message">{{ message }}</p>

    <!-- Display Profile -->
    <div v-if="!isEditing">
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>First Name:</strong> {{ profile.firstName || "N/A" }}</p>
      <p><strong>Last Name:</strong> {{ profile.lastName || "N/A" }}</p>
      <p><strong>Phone Number:</strong> {{ profile.phoneNumber || "N/A" }}</p>
      <p><strong>Address:</strong> {{ profile.address || "N/A" }}</p>
      <p><strong>Date of Birth:</strong> {{ profile.dateOfBirth || "N/A" }}</p>

      <button @click="isEditing = true">Edit Profile</button>
    </div>

    <!-- Edit Profile -->
    <form v-else @submit.prevent="saveProfile">
      <label>First Name:</label>
      <input v-model="profile.firstName" type="text" />

      <label>Last Name:</label>
      <input v-model="profile.lastName" type="text" />

      <label>Phone Number:</label>
      <input v-model="profile.phoneNumber" type="tel" />

      <label>Address:</label>
      <input v-model="profile.address" type="text" />

      <label>Date of Birth:</label>
      <input v-model="profile.dateOfBirth" type="date" />

      <button type="submit" :disabled="loading">
        {{ loading ? "Saving..." : "Save Changes" }}
      </button>
      <button type="button" @click="isEditing = false" class="cancel">Cancel</button>
    </form>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

p {
  margin: 10px 0;
}

button {
  margin-top: 15px;
  padding: 10px;
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

button.cancel {
  background: #e74c3c;
  margin-top: 10px;
}

button:disabled {
  background: #95a5a6;
}

.message {
  color: green;
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
