<template>
    <div v-if="post" class="post-details">
      <h1>{{ post.title }}</h1>
      <p>{{ post.description }}</p>
      <p>{{ post.detailedDescription }}</p>
      <p>{{ post.remarks }}</p>
      <p>{{ post.ammount }}</p>
  
      <div v-if="post.image" class="post-media">
        <img :src="post.image" alt="Post image" class="post-image" />
      </div>
  
      <div v-if="post.video" class="post-media">
        <video controls :src="post.video" class="post-video"></video>
      </div>
  
      <!-- User Information -->
      <div class="user-info">
        <h3>User Information:</h3>
        <p><strong>Name:</strong> {{ post.user.firstName }} {{ post.user.lastName }}</p>
        <p><strong>Email:</strong> {{ post.user.email }}</p>
        <p><strong>Phone:</strong> {{ post.user.phoneNumber }}</p>
        <p><strong>Address:</strong> {{ post.user.address }}</p>
        <p><strong>Date of Birth:</strong> {{ formatDate(post.user.dateOfBirth) }}</p>
        <p><strong>Role:</strong> {{ post.user.role }}</p>
        <p><strong>Verified:</strong> {{ post.user.verified ? 'Yes' : 'No' }}</p>
  
        <h4>Creator Profile:</h4>
        <p><strong>Profession:</strong> {{ post.user.creatorProfile.profession }}</p>
        <p><strong>Genre:</strong> {{ post.user.creatorProfile.genre }}</p>
        <p><strong>Bio:</strong> {{ post.user.creatorProfile.bio }}</p>
        <p><strong>Offers:</strong> {{ post.user.creatorProfile.offers }}</p>
        <p><strong>Type of Profession:</strong> {{ post.user.creatorProfile.typeOfProfession }}</p>
      </div>
  
      <!-- Timestamps -->
      <div class="timestamps">
        <p><strong>Created At:</strong> {{ formatDate(post.createdAt) }}</p>
        <p><strong>Updated At:</strong> {{ formatDate(post.updatedAt) }}</p>
      </div>
  
      <router-link to="/dashboard" class="back-btn">Back to Posts</router-link>
    </div>
  
    <div v-else>
      <p>Loading post details...</p>
    </div>
  </template>
  
  <script>
  import { fetchPostDetails } from '../authService.js';
  
  export default {
    data() {
      return {
        post: null,
        error: null,
      };
    },
    async created() {
      const postId = this.$route.params.postId; // Get the postId from route params
      try {
        this.post = await fetchPostDetails(postId);
      } catch (error) {
        this.error = 'Failed to load post details';
        console.error("Error fetching post details:", error);
      }
    },
    methods: {
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
    },
  };
  </script>
  
  <style scoped>
  .post-details {
    padding: 20px;
  }
  
  .post-title {
    font-size: 2rem;
    font-weight: bold;
  }
  
  .post-description {
    margin-top: 10px;
  }
  
  .post-media img, .post-media video {
    max-width: 100%;
    margin-top: 10px;
  }
  
  .user-info {
    margin-top: 20px;
    font-style: italic;
  }
  
  .timestamps {
    margin-top: 20px;
  }
  
  .back-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 16px;
    background-color: #007BFF;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  
  .back-btn:hover {
    background-color: #0056b3;
  }
  </style>
  