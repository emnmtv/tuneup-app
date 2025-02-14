<template>
  <div v-if="posts && posts.length" class="posts-list">
    <div v-for="post in posts" :key="post.id" class="post">
      <h3>{{ post.title }}</h3>
      <p>{{ post.description }}</p>

      <div v-if="post.image" class="post-media">
        <img :src="post.image" alt="Post image" class="post-image" />
      </div>

      <div v-if="post.video" class="post-media">
        <video controls :src="post.video" class="post-video"></video>
      </div>

      <div v-if="post.user" class="user-info">
        <h4>Created by: {{ post.user.firstName }} {{ post.user.lastName }}</h4>
        <p>Profession: {{ post.user.creatorProfile?.profession }}</p>
        <p>Genre: {{ post.user.creatorProfile?.genre }}</p>
      </div>

      <!-- View Details Button -->
      <router-link :to="{ name: 'PostDetails', params: { postId: post.id } }">
        <button class="view-details-btn">View Details</button>
      </router-link>
    </div>
  </div>

  <div v-else>
    <p>No posts available.</p>
  </div>
</template>

<script>
import { fetchAllPosts } from '../authService.js';

export default {
  data() {
    return {
      posts: [],
      error: null,
    };
  },
  async created() {
    try {
      this.posts = await fetchAllPosts();
    } catch (error) {
      this.error = 'Failed to load posts';
      console.error("Error fetching posts:", error);
    }
  },
};
</script>

<style scoped>
.posts-list {
  padding: 20px;
}

.post {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.post-title {
  font-size: 1.5rem;
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
  margin-top: 15px;
  font-style: italic;
}

.view-details-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.view-details-btn:hover {
  background-color: #45a049;
}
</style>
