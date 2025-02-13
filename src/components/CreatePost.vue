<template>
    <div>
      <form @submit.prevent="handleSubmit">
        <input v-model="title" placeholder="Title" />
        <textarea v-model="description" placeholder="Description"></textarea>
  
        <input type="file" @change="handleImageUpload" accept="image/*" />
        <input type="file" @change="handleVideoUpload" accept="video/*" />
  
        <button type="submit">Post</button>
      </form>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { createPost } from '../authService'; // Ensure authService.js is updated
  
  export default {
    data() {
      return {
        title: '',
        description: '',
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
            image: this.image,
            video: this.video,
          };
          await createPost(postData);
          alert('Post created successfully');
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
    },
  };
  </script>
  