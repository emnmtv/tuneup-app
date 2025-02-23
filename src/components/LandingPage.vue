<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Welcome to TuneUp</h1>
        <p class="hero-subtitle">Connect with talented musicians, producers, and creators</p>
        <div class="hero-buttons">
          <button class="primary-btn" @click="$router.push('/login')">
            <i class="material-icons">login</i>
            Sign In
          </button>
          <button class="secondary-btn" @click="$router.push('/register')">
            <i class="material-icons">person_add</i>
            Join Now
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <h2>Why Choose TuneUp?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <i class="material-icons">group</i>
          <h3>Connect</h3>
          <p>Find and collaborate with talented musicians worldwide</p>
        </div>
        <div class="feature-card">
          <i class="material-icons">music_note</i>
          <h3>Create</h3>
          <p>Share your music and showcase your talents</p>
        </div>
        <div class="feature-card">
          <i class="material-icons">trending_up</i>
          <h3>Grow</h3>
          <p>Build your audience and expand your reach</p>
        </div>
      </div>
    </div>

    <!-- Featured Posts Section -->
    <div class="featured-section">
      <div class="section-header">
        <h2>Featured Artists</h2>
        <p>Discover amazing talents in our community</p>
      </div>

      <div class="posts-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="handlePostClick(post.id)"
        >
          <div class="post-media">
            <img 
              :src="post.image || '/default-post-image.jpg'" 
              :alt="post.title"
              class="post-image"
            />
            <div class="post-overlay">
              <span class="view-details">View Details</span>
            </div>
          </div>
          
          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-description">{{ truncateText(post.description, 100) }}</p>
            
            <div class="post-footer">
              <div class="user-info">
                <div class="user-avatar">
                  {{ getInitials(post.user?.firstName, post.user?.lastName) }}
                </div>
                <div class="user-details">
                  <h4>{{ post.user?.firstName }} {{ post.user?.lastName }}</h4>
                  <p class="profession" v-if="post.user?.creatorProfile?.profession">
                    {{ post.user.creatorProfile.profession }}
                  </p>
                </div>
              </div>
              <div class="post-tags" v-if="post.user?.creatorProfile?.genre">
                <span class="tag">{{ post.user.creatorProfile.genre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action Section -->
    <div class="cta-section">
      <h2>Ready to Join Our Community?</h2>
      <p>Start your musical journey with TuneUp today</p>
      <button class="cta-button" @click="$router.push('/register')">
        Get Started
      </button>
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
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getInitials(firstName, lastName) {
      if (!firstName || !lastName) return '??';
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
  }
};
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.hero-section {
  background: linear-gradient(135deg, #2196f3, #1565c0);
  padding: 6rem 2rem;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/slash.jpg') center/cover;
  opacity: 0.1;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-section h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.primary-btn {
  background: white;
  color: #2196f3;
  border: none;
}

.secondary-btn {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.primary-btn:hover, .secondary-btn:hover {
  transform: translateY(-2px);
}

.features-section {
  padding: 5rem 2rem;
  background: white;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 3rem;
  color: #2196f3;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.featured-section {
  padding: 5rem 2rem;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.15);
}

.post-media {
  position: relative;
  height: 200px;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.post-card:hover .post-overlay {
  opacity: 1;
}

.view-details {
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 2px solid white;
  border-radius: 20px;
}

.post-content {
  padding: 1.5rem;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-details h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.profession {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.tag {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.cta-section {
  text-align: center;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  color: white;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-button {
  background: white;
  color: #2196f3;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 1rem;
  }

  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style> 