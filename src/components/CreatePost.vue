<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <!-- Title -->
      <input v-model="title" placeholder="Title" required />

      <!-- Description -->
      <textarea v-model="description" placeholder="Description" required></textarea>

      <!-- Detailed Description -->
      <textarea v-model="detailedDescription" placeholder="Detailed Description"></textarea>

      <!-- Amount -->
      <input v-model="amount" type="number" placeholder="Amount" />

      <!-- Remarks -->
      <input v-model="remarks" placeholder="Remarks" />

      <!-- Image Upload -->
      <input type="file" @change="handleImageUpload" accept="image/*" />

      <!-- Video Upload -->
      <input type="file" @change="handleVideoUpload" accept="video/*" />

      <!-- Submit Button -->
      <button type="submit">Post</button>
    </form>

    <!-- Error Message -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { createPost } from '../authService'; // Ensure authService.js is updated

export default {
  data() {
    return {
      title: '',
      description: '',
      detailedDescription: '', // New field
      amount: null, // New field
      remarks: '', // New field
      image: null,
      video: null,
      errorMessage: '',
    };
  },
  methods: {
    handleImageUpload(event) {
      this.image = event.target.files[0]; // Store actual File object
    },
    handleVideoUpload(event) {
      this.video = event.target.files[0]; // Store actual File object
    },
    async handleSubmit() {
      try {
        const postData = {
          title: this.title,
          description: this.description,
          detailedDescription: this.detailedDescription, // New field
          amount: this.amount, // New field
          remarks: this.remarks, // New field
          image: this.image,
          video: this.video,
        };

        await createPost(postData);
        alert('Post created successfully');

        // Reset form after successful submission
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    resetForm() {
      this.title = '';
      this.description = '';
      this.detailedDescription = '';
      this.amount = null;
      this.remarks = '';
      this.image = null;
      this.video = null;
      this.errorMessage = '';
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>