<template>
  <div v-if="posts && posts.length" class="posts-grid">
    <router-link
      v-for="post in posts"
      :key="post.id"
      :to="{ name: 'PostDetails', params: { postId: post.id } }"
      class="post-card"
    >
      <div v-if="post.image" class="post-media">
        <img :src="post.image" alt="Post image" class="post-image" />
      </div>
      
      <div class="post-content">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-description">{{ post.description }}</p>
        
        <div v-if="post.user" class="user-info">
          <h4>{{ post.user.firstName }} {{ post.user.lastName }}</h4>
          <p class="profession">{{ post.user.creatorProfile?.profession }}</p>
          <p class="genre">{{ post.user.creatorProfile?.genre }}</p>
        </div>
      </div>
    </router-link>
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
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-media {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-title {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #333;
}

.post-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.user-info {
  padding: 1rem 0;
  border-top: 1px solid #eee;
}

.user-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.profession, .genre {
  font-size: 0.9rem;
  color: #666;
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
