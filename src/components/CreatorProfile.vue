<template>
    <div class="creator-profile">
      <h1>Edit Profile</h1>
  
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  
      <div v-if="loading" class="loading-message">Loading profile...</div>
  
      <div v-else>
        <form @submit.prevent="handleSubmit">
          <div>
            <label for="offers">Offers</label>
            <input
              type="text"
              id="offers"
              v-model="profile.offers"
              required
            />
          </div>
          
          <div>
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              v-model="profile.bio"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
  
          <div>
            <label for="profession">Profession</label>
            <input
              type="text"
              id="profession"
              v-model="profile.profession"
              placeholder="Your profession"
            />
          </div>
  
          <div>
            <label for="typeOfProfession">Type of Profession</label>
            <input
              type="text"
              id="typeOfProfession"
              v-model="profile.typeOfProfession"
              placeholder="e.g., Guitarist, Drummer"
            />
          </div>
  
          <div>
            <label for="genre">Genre</label>
            <input
              type="text"
              id="genre"
              v-model="profile.genre"
              placeholder="e.g., Rock, Jazz"
            />
          </div>
  
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { getCreatorProfile, editCreatorProfile } from "../authService.js"; // Adjust the import path
  
  export default {
    name: "CreatorProfile",
    setup() {
      const profile = ref({
        offers: "",
        bio: "",
        profession: "",
        typeOfProfession: "",
        genre: "",
      });
      const loading = ref(true);
      const errorMessage = ref(null);
  
      // Fetch the creator profile on component mount
      const fetchProfile = async () => {
        try {
          const data = await getCreatorProfile();
          profile.value = data.creatorProfile; // Adjust according to the response structure
          loading.value = false;
        } catch (error) {
          errorMessage.value = error.message;
          loading.value = false;
        }
      };
  
      const handleSubmit = async () => {
  try {
    // Directly use the result of the profile update
    await editCreatorProfile(profile.value);
    alert("Profile updated successfully!");
  } catch (error) {
    errorMessage.value = error.message;
  }
};

  
      onMounted(() => {
        fetchProfile();
      });
  
      return {
        profile,
        loading,
        errorMessage,
        handleSubmit,
      };
    },
  };
  </script>
  
  <style scoped>
  .creator-profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .error-message {
    color: red;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .loading-message {
    text-align: center;
    margin-bottom: 20px;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  form div {
    margin-bottom: 15px;
  }
  
  label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input,
  textarea {
    padding: 10px;
    font-size: 16px;
    width: 100%;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  button {
    padding: 10px 15px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  