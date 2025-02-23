<template>
  <div class="landing-container">
    <div class="hero-section">
      <h1>Welcome to TuneUp</h1>
      <p>Connect with musicians, producers, and creators</p>
    </div>

    <div class="posts-grid">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        @click="handlePostClick(post.id)"
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
      </div>
    </div>
  </div>
</template>

<script>
import { fetchAllPosts } from '../authService.js';
import Swal from 'sweetalert2';

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

    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token')) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    async handlePostClick(postId) {
      if (!localStorage.getItem('token')) {
        // Store the post ID for redirect after login
        sessionStorage.setItem('lastViewedPost', postId);
        
        const result = await Swal.fire({
          title: 'Join TuneUp',
          text: 'Sign in or create an account to view more details',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Register',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#2ecc71',
        });

        if (result.isConfirmed) {
          this.$router.push({
            path: '/login',
            query: { redirect: `/post/${postId}` }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.$router.push({
            path: '/register',
            query: { redirect: `/post/${postId}` }
          });
        }
      } else {
        this.$router.push(`/post/${postId}`);
      }
    }
  }
};
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background-color: #f5f7fb;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  margin-bottom: 2rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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
  line-height: 1.5;
}

.user-info {
  padding: 1rem 0;
  border-top: 1px solid #eee;
}

.user-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.profession, .genre {
  font-size: 0.9rem;
  color: #666;
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
}
</style> 