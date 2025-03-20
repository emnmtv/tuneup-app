<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-text">
          <h1>Discover & Connect with Musicians</h1>
          <p class="hero-subtitle">Join the community of talented artists, producers, and music enthusiasts</p>
          <div class="hero-buttons">
            <button class="primary-btn" @click="$router.push('/login')">
              <i class="material-icons">login</i>
              Get Started
            </button>
            <button class="secondary-btn" @click="$router.push('/register')">
              Learn More
              <i class="material-icons">arrow_forward</i>
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="@/assets/slash.jpg" alt="Music" />
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-item">
        <h3>1000+</h3>
        <p>Active Musicians</p>
      </div>
      <div class="stat-item">
        <h3>500+</h3>
        <p>Collaborations</p>
      </div>
      <div class="stat-item">
        <h3>50+</h3>
        <p>Music Genres</p>
      </div>
    </div>

    <!-- Featured Artists Section -->
    <div class="featured-section">
      <div class="section-header">
        <h2>Featured Artists</h2>
        <p>Discover amazing talents in our community</p>
      </div>

      <div class="posts-carousel">
        <div class="posts-track">
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
              <div class="post-price" v-if="post.amount">
                ₱{{ formatAmount(post.amount) }}
              </div>
              <div class="post-overlay">
                <div class="overlay-content">
                  <span class="view-details">View Details</span>
                  <i class="material-icons">arrow_forward</i>
                </div>
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
                    <div class="user-tags">
                      <span class="profession" v-if="post.user?.creatorProfile?.profession">
                        {{ post.user.creatorProfile.profession }}
                      </span>
                      <span class="genre" v-if="post.user?.creatorProfile?.genre">
                        {{ post.user.creatorProfile.genre }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-content">
        <div class="features-text">
          <h2>Why Choose TuneUp?</h2>
          <div class="feature-list">
            <div class="feature-item">
              <i class="material-icons">group</i>
              <div class="feature-details">
                <h3>Connect with Musicians</h3>
                <p>Find and collaborate with talented artists worldwide</p>
              </div>
            </div>
            <div class="feature-item">
              <i class="material-icons">workspace_premium</i>
              <div class="feature-details">
                <h3>Quality Services</h3>
                <p>Access professional music services and expertise</p>
              </div>
            </div>
            <div class="feature-item">
              <i class="material-icons">payments</i>
              <div class="feature-details">
                <h3>Secure Payments</h3>
                <p>Safe and reliable payment processing</p>
              </div>
            </div>
          </div>
        </div>
        <div class="features-image">
          <img src="@/assets/slash.jpg" alt="Features" />
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-content">
        <h2>Ready to Start Your Musical Journey?</h2>
        <p>Join TuneUp today and connect with amazing musicians</p>
        <button class="cta-button" @click="$router.push('/register')">
          Get Started Now
          <i class="material-icons">arrow_forward</i>
        </button>
      </div>
      <div class="cta-pattern"></div>
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
    },
    formatAmount(amount) {
      return amount.toLocaleString();
    }
  }
};
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background-color: #ffffff;
  max-width: auto;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 85vh;
  background: linear-gradient(135deg, #1a237e, #0d47a1);
  overflow: hidden;
  padding: 4rem 2rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/slash.jpg') center/cover;
  opacity: 0.1;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  color: white;
}

.hero-text h1 {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #00c853;
  color: white;
  border: none;
}

.secondary-btn {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.primary-btn:hover {
  background: #00e676;
  transform: translateY(-2px);
}

.secondary-btn:hover {
  border-color: white;
  transform: translateY(-2px);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 1200px;
  margin: -50px auto 0;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.stat-item {
  text-align: center;
  padding: 2rem;
}

.stat-item h3 {
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.stat-item p {
  color: #666;
  font-size: 1.1rem;
}

/* Featured Section */
.featured-section {
  padding: 6rem 2rem;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 1rem;
}

.posts-carousel {
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.posts-track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
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

.post-price {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
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

.overlay-content {
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

.user-tags {
  display: flex;
  gap: 0.5rem;
}

.profession {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.genre {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.features-section {
  padding: 6rem 2rem;
  background: white;
}

.features-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.features-text {
  color: #333;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-item i {
  font-size: 2rem;
  color: #2196f3;
}

.feature-details {
  flex: 1;
}

.feature-details h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feature-details p {
  font-size: 1.1rem;
}

.features-image {
  text-align: right;
}

.features-image img {
  max-width: 100%;
  height: auto;
}

.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  color: white;
}

.cta-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.cta-button {
  background: white;
  color: #2196f3;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.cta-pattern {
  height: 100px;
  background: url('@/assets/mini.jpg') repeat-x;
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-image {
    display: none;
  }

  .stats-section {
    grid-template-columns: 1fr;
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .features-content {
    grid-template-columns: 1fr;
  }

  .features-image {
    display: none;
  }
}
</style>