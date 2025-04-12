<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-text">
          <h1>Discover & Connect<br><span class="highlight">with Musicians</span></h1>
          <p class="hero-subtitle">Join our community of talented artists, producers, and music enthusiasts around the world</p>
          <div class="hero-buttons">
            <button class="primary-btn" @click="$router.push('/login')">
              <i class="material-icons">login</i>
              Get Started
            </button>
            <button class="secondary-btn" @click="$router.push('/register')">
              Join TuneUp
              <i class="material-icons">arrow_forward</i>
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="@/assets/slash.jpg" alt="Music" />
        </div>
      </div>
      
      <!-- Wave separator -->
      <div class="wave-separator">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-icon">
          <i class="material-icons">people</i>
        </div>
        <h3>1000+</h3>
        <p>Active Musicians</p>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <i class="material-icons">handshake</i>
        </div>
        <h3>500+</h3>
        <p>Collaborations</p>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <i class="material-icons">music_note</i>
        </div>
        <h3>50+</h3>
        <p>Music Genres</p>
      </div>
    </div>

    <!-- Featured Artists Section -->
    <div class="featured-section">
      <div class="section-header">
        <h2>Featured <span class="highlight">Artists</span></h2>
        <p>Discover amazing talents in our community</p>
      </div>

      <div class="posts-carousel">
        <div class="posts-track">
          <div
            v-for="post in posts.slice(0, 3)"
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
      <div class="section-header">
        <h2>Why Choose <span class="highlight">TuneUp</span>?</h2>
        <p>The platform that connects musicians and fans worldwide</p>
      </div>
      
      <div class="features-content">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="material-icons">group</i>
          </div>
          <h3>Connect with Musicians</h3>
          <p>Find and collaborate with talented artists worldwide</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="material-icons">workspace_premium</i>
          </div>
          <h3>Quality Services</h3>
          <p>Access professional music services and expertise</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="material-icons">payments</i>
          </div>
          <h3>Secure Payments</h3>
          <p>Safe and reliable payment processing</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="material-icons">emoji_events</i>
          </div>
          <h3>Quality Talent</h3>
          <p>Work with the best musicians in your genre</p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-content">
        <h2>Ready to Start Your Musical Journey?</h2>
        <p>Join TuneUp today and connect with amazing musicians</p>
        <div class="cta-buttons">
          <button class="cta-button primary" @click="$router.push('/register')">
            Sign Up Free
            <i class="material-icons">arrow_forward</i>
          </button>
          <button class="cta-button secondary" @click="$router.push('/login')">
            Login
            <i class="material-icons">login</i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <h2>TuneUp</h2>
          <p>Connecting Musicians Worldwide</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h3>Platform</h3>
            <ul>
              <li>Features</li>
              <li>Security</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div class="link-group">
            <h3>Community</h3>
            <ul>
              <li>Artists</li>
              <li>Producers</li>
              <li>Venues</li>
            </ul>
          </div>
          <div class="link-group">
            <h3>Support</h3>
            <ul>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2023 TuneUp. All rights reserved.</p>
      </div>
    </footer>
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
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 90vh;
  background: linear-gradient(135deg, #1a237e, #311b92);
  overflow: hidden;
  padding: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/slash.jpg') center/cover;
  opacity: 0.15;
}

.wave-separator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  line-height: 0;
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
  padding: 5rem 2rem;
  height: 90vh;
}

.hero-text {
  color: white;
}

.hero-text h1 {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.highlight {
  color: #64ffda;
  position: relative;
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2.5rem;
  max-width: 600px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.primary-btn {
  background: #64ffda;
  color: #1a237e;
  border: none;
}

.secondary-btn {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.primary-btn:hover {
  background: #00e676;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}

.secondary-btn:hover {
  border-color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}

.hero-image img {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transform: rotate(2deg);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a237e;
  background: rgba(100, 255, 218, 0.2);
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
}

.stat-icon i {
  font-size: 2.5rem;
  color: #311b92;
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
  padding: 5rem 2rem;
  background: #f9fafb;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 1rem;
  font-weight: 700;
}

.posts-carousel {
  max-width: 1400px;
  margin: 0 auto;
}

.posts-track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.post-media {
  position: relative;
  height: 220px;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-price {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(49, 27, 146, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
}

.post-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 35, 126, 0.6);
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
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-content {
  padding: 1.5rem;
}

.post-title {
  font-size: 1.4rem;
  margin-bottom: 0.75rem;
  color: #1a237e;
}

.post-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
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
  background: #311b92;
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
  margin-top: 0.25rem;
}

.profession, .genre {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.profession {
  background: rgba(100, 255, 218, 0.2);
  color: #1a237e;
}

.genre {
  background: rgba(49, 27, 146, 0.1);
  color: #311b92;
}

/* Features Section */
.features-section {
  padding: 5rem 2rem;
  background: white;
}

.features-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon i {
  font-size: 2.5rem;
  color: #311b92;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1a237e;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #1a237e, #311b92);
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.cta-content p {
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.cta-button {
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.cta-button.primary {
  background: #64ffda;
  color: #1a237e;
  border: none;
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.25);
}

.cta-button.primary:hover {
  background: #00e676;
}

.cta-button.secondary:hover {
  border-color: white;
}

/* Footer */
.landing-footer {
  background: #0d1b42;
  padding: 4rem 2rem 2rem;
  color: white;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;
}

.footer-logo h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.footer-logo p {
  color: rgba(255,255,255,0.7);
}

.footer-links {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.link-group h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #64ffda;
}

.link-group ul {
  padding: 0;
  list-style: none;
}

.link-group li {
  margin-bottom: 0.75rem;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: color 0.2s;
}

.link-group li:hover {
  color: white;
}

.footer-bottom {
  max-width: 1200px;
  margin: 3rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  color: rgba(255,255,255,0.5);
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .hero-content, .stats-section, .features-content, .footer-content {
    max-width: 95%;
  }
  
  .hero-text h1 {
    font-size: 3.5rem;
  }
}

@media (max-width: 992px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    height: auto;
    padding: 5rem 2rem 8rem;
  }
  
  .hero-text h1 {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    margin: 0 auto 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-image {
    display: none;
  }
  
  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    margin-top: -3rem;
  }
  
  .features-content {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  
  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-links {
    justify-content: space-between;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .cta-content p {
    font-size: 1.2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .cta-button {
    width: 100%;
    justify-content: center;
  }
  
  .posts-track {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    min-height: auto;
  }
  
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stat-item {
    padding: 1.5rem;
  }
  
  .featured-section, .features-section, .cta-section {
    padding: 3rem 1rem;
  }
}
</style>