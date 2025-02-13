<template>
  <div v-if="user" class="user-profile">
    <h1 class="user-name">{{ user.firstName }} {{ user.lastName }}</h1>
    <p class="user-email">{{ user.email }}</p>
    <p class="user-phone">{{ user.phoneNumber }}</p>
    <p class="user-address">{{ user.address }}</p>

    <div v-if="user.creatorProfile" class="profile-info">
      <h2>Profile Information</h2>
      <p><strong>Offers:</strong> {{ user.creatorProfile.offers }}</p>
      <p><strong>Bio:</strong> {{ user.creatorProfile.bio }}</p>
      <p><strong>Profession:</strong> {{ user.creatorProfile.profession }}</p>
      <p><strong>Genre:</strong> {{ user.creatorProfile.genre }}</p>
    </div>

    <div v-if="user.posts && user.posts.length" class="user-posts">
      <h2>Posts</h2>
      <div v-for="post in user.posts" :key="post.id" class="post">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-description">{{ post.description }}</p>
        
        <div v-if="post.image" class="post-media">
          <img :src="post.image" alt="Post image" class="post-image" />
        </div>
        
        <div v-if="post.video" class="post-media">
          <video controls :src="post.video" class="post-video"></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUserProfileAndPosts } from '../authService.js';

export default {
  data() {
    return {
      user: null,
      userId: 1, // The userId to fetch; you can update this as necessary
    };
  },
  async created() {
    // Ensure the component isn't fetching again once the user data is set
    if (!this.user) {
      console.log('Fetching user data...');
      try {
        const userData = await fetchUserProfileAndPosts(this.userId);
        if (userData) {
          this.user = userData;
          console.log('User data fetched:', userData);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
  },
};
</script>


<style scoped>
/* General styling for the profile */
.user-profile {
  font-family: Arial, sans-serif;
  margin: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 800px;
  margin: 0 auto;
}

.user-name {
  font-size: 2em;
  color: #333;
  margin-bottom: 10px;
}

.user-email,
.user-phone,
.user-address {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 5px;
}

.profile-info {
  margin-top: 30px;
}

.profile-info h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.profile-info p {
  font-size: 1.1em;
  color: #555;
}

.user-posts {
  margin-top: 30px;
}

.user-posts h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.post {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
}

.post-title {
  font-size: 1.3em;
  color: #333;
}

.post-description {
  font-size: 1.1em;
  color: #666;
}

.post-media {
  margin-top: 15px;
}

.post-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.post-video {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
