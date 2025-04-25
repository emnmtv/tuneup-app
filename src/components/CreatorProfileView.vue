<template>
  <div class="creator-profile-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="material-icons">error_outline</i>
      </div>
      <p>{{ error }}</p>
      <button @click="fetchCreatorProfile" class="retry-btn">Retry</button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="creatorProfile" class="profile-content">
      <!-- Cover and Profile Pictures -->
      <div class="profile-header">
        <div class="cover-photo" :style="coverPhotoStyle">
          <div class="back-button-container">
            <button @click="handleBack" class="back-button">
              <i class="material-icons">arrow_back</i>
              Back
            </button>
          </div>
          <div class="profile-picture" :style="profilePictureStyle">
            <div v-if="!hasProfilePicture" class="initials">
              {{ getInitials(creatorProfile.user.firstName, creatorProfile.user.lastName) }}
            </div>
          </div>
        </div>

        <!-- Profile Info Header -->
        <div class="profile-info-header">
          <div class="creator-name-container">
            <h1 class="creator-name">
              {{ creatorProfile.user.firstName }} {{ creatorProfile.user.lastName }}
            </h1>
            <div class="verification-badge" v-if="creatorProfile.isVerified">
              <i class="material-icons">verified</i>
              <span>Verified Creator</span>
            </div>
          </div>
          
          <div class="creator-rating">
            <div class="stars">
              <i v-for="n in 5" :key="n" class="material-icons" 
                :class="{ 'filled': n <= Math.round(creatorProfile.creatorLevel) }">
                star
              </i>
            </div>
            <span class="rating-text">{{ creatorProfile.creatorLevel.toFixed(1) }}/5.0</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="profile-grid">
        <!-- Left Side: Main Info -->
        <div class="profile-main-info">
          <!-- Profession Section -->
          <div class="info-section">
            <h2 class="section-title">
              <i class="material-icons">work</i>
              Profession
            </h2>
            <div class="profession-details">
              <div class="profession-item">
                <span class="label">Main Profession:</span>
                <span class="value">{{ creatorProfile.profession || 'Not specified' }}</span>
              </div>
              <div class="profession-item">
                <span class="label">Type:</span>
                <span class="value">{{ creatorProfile.typeOfProfession || 'Not specified' }}</span>
              </div>
              <div class="profession-item">
                <span class="label">Genre:</span>
                <span class="value">{{ creatorProfile.genre || 'Not specified' }}</span>
              </div>
            </div>
          </div>

          <!-- Bio Section -->
          <div class="info-section">
            <h2 class="section-title">
              <i class="material-icons">person</i>
              About
            </h2>
            <p class="bio-text">{{ creatorProfile.bio || 'No bio provided' }}</p>
          </div>

          <!-- Services Offered -->
          <div class="info-section">
            <h2 class="section-title">
              <i class="material-icons">list</i>
              Services Offered
            </h2>
            <div class="services-list">
              <div v-for="(service, index) in getServices(creatorProfile.offers)" :key="index" class="service-tag">
                {{ service }}
              </div>
              <div v-if="!creatorProfile.offers" class="no-data">No services specified</div>
            </div>
          </div>
          
          <!-- Posts Section -->
          <div class="info-section">
            <h2 class="section-title">
              <i class="material-icons">feed</i>
              Posts
            </h2>
            <div v-if="creatorPosts.length > 0" class="posts-grid">
              <div v-for="post in creatorPosts" :key="post.id" class="post-card" @click="viewPost(post.id)">
                <div class="post-image" v-if="post.image" :style="{ backgroundImage: `url(${post.image})` }"></div>
                <div class="post-image post-video" v-else-if="post.video">
                  <i class="material-icons video-icon">play_circle_filled</i>
                </div>
                <div class="post-image post-audio" v-else-if="post.audio">
                  <i class="material-icons audio-icon">audiotrack</i>
                </div>
                <div class="post-image no-media" v-else>
                  <i class="material-icons no-media-icon">description</i>
                </div>
                <div class="post-info">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-description">{{ truncateText(post.description, 100) }}</p>
                  <div class="post-price" v-if="post.amount">
                    ₱{{ formatAmount(post.amount) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-posts">
              <p>No posts available</p>
            </div>
          </div>
        </div>

        <!-- Right Side: Sidebar -->
        <div class="profile-sidebar">
          <!-- Contact Section -->
          <div class="sidebar-section">
            <h2 class="section-title">
              <i class="material-icons">contact_mail</i>
              Contact
            </h2>
            <button @click="sendMessage" class="contact-button">
              <i class="material-icons">mail</i>
              Send Message
            </button>
          </div>

          <!-- Documents Section -->
          <div class="sidebar-section" v-if="hasDocuments">
            <h2 class="section-title">
              <i class="material-icons">folder</i>
              Documents
            </h2>
            <div class="documents-list">
              <a v-if="creatorProfile.portfolioFile" :href="getDocumentUrl(creatorProfile.portfolioFile)" 
                 target="_blank" class="document-link">
                <i class="material-icons">insert_drive_file</i>
                <span>Portfolio</span>
              </a>
              <a v-if="creatorProfile.resumeFile" :href="getDocumentUrl(creatorProfile.resumeFile)" 
                 target="_blank" class="document-link">
                <i class="material-icons">description</i>
                <span>Resume</span>
              </a>
            </div>
          </div>

          <!-- Social Media Section -->
          <div class="sidebar-section" v-if="creatorProfile.socialLinks && creatorProfile.socialLinks.length > 0">
            <h2 class="section-title">
              <i class="material-icons">share</i>
              Social Media
            </h2>
            <div class="social-links">
              <a v-for="link in creatorProfile.socialLinks" 
                 :key="link.id" 
                 :href="link.url" 
                 target="_blank" 
                 class="social-link">
                <i class="material-icons">{{ getSocialIcon(link.platform) }}</i>
                <span>{{ link.platform }}</span>
              </a>
            </div>
          </div>

          <!-- Ratings Section -->
          <div class="sidebar-section" v-if="ratings">
            <h2 class="section-title">
              <i class="material-icons">star</i>
              Ratings & Reviews
            </h2>
            <div class="rating-stats">
              <div class="avg-rating">{{ ratings.stats.average.toFixed(1) }}</div>
              <div class="rating-stars">
                <i v-for="n in 5" :key="n" class="material-icons" 
                   :class="{ 'filled': n <= Math.round(ratings.stats.average) }">
                  star
                </i>
              </div>
              <div class="total-ratings">{{ ratings.stats.total }} ratings</div>
            </div>
            
            <div class="reviews" v-if="ratings.ratings.length > 0">
              <div v-for="(review, index) in ratings.ratings.slice(0, 3)" :key="index" class="review-item">
                <div class="review-header">
                  <div class="reviewer-name">{{ review.client.firstName }} {{ review.client.lastName }}</div>
                  <div class="review-rating">
                    <i v-for="n in 5" :key="n" class="material-icons" 
                       :class="{ 'filled': n <= review.rating }">
                      star
                    </i>
                  </div>
                </div>
                <p class="review-text" v-if="review.review">{{ review.review }}</p>
                <div class="review-date">{{ formatDate(review.createdAt) }}</div>
              </div>
              <button v-if="ratings.ratings.length > 3" @click="showAllReviews" class="view-all-btn">
                View all {{ ratings.ratings.length }} reviews
              </button>
            </div>
            <div v-else class="no-reviews">
              No reviews yet
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="message-modal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Send Message to {{ creatorProfile?.user.firstName }}</h3>
          <button @click="closeMessageModal" class="close-btn">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="messageText" 
            placeholder="Type your message here..."
            rows="6"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="closeMessageModal" class="cancel-btn">Cancel</button>
          <button @click="submitMessage" class="submit-btn" :disabled="!messageText.trim() || sendingMessage">
            <i class="material-icons">send</i>
            {{ sendingMessage ? 'Sending...' : 'Send' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reviews Modal -->
    <div v-if="showReviewsModal" class="reviews-modal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>All Reviews</h3>
          <button @click="closeReviewsModal" class="close-btn">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body reviews-list">
          <div v-for="(review, index) in ratings.ratings" :key="index" class="review-item">
            <div class="review-header">
              <div class="reviewer-name">{{ review.client.firstName }} {{ review.client.lastName }}</div>
              <div class="review-rating">
                <i v-for="n in 5" :key="n" class="material-icons" 
                   :class="{ 'filled': n <= review.rating }">
                  star
                </i>
              </div>
            </div>
            <p class="review-text" v-if="review.review">{{ review.review }}</p>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCreatorProfile, getPosts, initiateChat } from '@/authService';
import { MEDIA_BASE_URL } from '@/config';
import Swal from 'sweetalert2';

// ... existing code ...
</script>

<style scoped>
.creator-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.material-icons {
  margin-right: 0.5rem;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: 2rem;
}

.spinner {
  margin-bottom: 1rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #6200ea;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  background-color: #6200ea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #5000c7;
}

.profile-header {
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 70px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cover-photo {
  width: 100%;
  height: 100%;
}

.profile-picture-container {
  position: absolute;
  bottom: -50px;
  left: 30px;
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: white;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  background-color: #6200ea;
}

.profile-info {
  margin-top: 60px;
  margin-left: 30px;
  display: flex;
  align-items: center;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-right: 10px;
}

.verified-badge {
  color: #1976d2;
  margin-right: 10px;
}

.creator-level {
  display: flex;
  align-items: center;
}

.creator-level-stars {
  color: #ffc107;
  margin-left: 5px;
}

.star {
  margin-right: -4px;
}

.profile-profession {
  font-size: 1.1rem;
  color: #757575;
  margin-left: 30px;
  margin-bottom: 1.5rem;
}

.profile-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Left column styles */
.profile-main {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: white;
  padding: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.section-content {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.service-tag {
  background-color: #e0e0e0;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #333;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.post-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.post-details {
  padding: 1rem;
}

.post-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.post-date {
  font-size: 0.8rem;
  color: #757575;
}

.empty-posts {
  text-align: center;
  padding: 1rem;
  color: #757575;
  font-style: italic;
}

/* Right column styles */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.contact-button {
  background-color: #6200ea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1rem;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-button:hover {
  background-color: #5000c7;
}

.contact-button .material-icons {
  margin-right: 0.5rem;
}

.sidebar-list {
  margin-top: 1rem;
}

.sidebar-list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-list-item:last-child {
  border-bottom: none;
}

.sidebar-list-item .material-icons {
  margin-right: 0.8rem;
  color: #6200ea;
}

.social-link {
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
}

.social-link:hover {
  color: #6200ea;
}

.document-link {
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.document-link:hover {
  color: #6200ea;
}

.document-link .material-icons {
  margin-right: 0.8rem;
  color: #d32f2f;
}

.sidebar-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-avg {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.rating-total {
  font-size: 0.9rem;
  color: #757575;
}

.rating-stars {
  display: flex;
  color: #ffc107;
  margin-top: 0.5rem;
}

.view-all-reviews {
  margin-top: 1rem;
  text-align: center;
  color: #6200ea;
  cursor: pointer;
  font-weight: bold;
}

.view-all-reviews:hover {
  text-decoration: underline;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #757575;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.modal-content {
  margin-bottom: 1.5rem;
}

.message-textarea {
  width: 100%;
  height: 120px;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  margin-bottom: 1rem;
}

.message-textarea:focus {
  outline: none;
  border-color: #6200ea;
}

.modal-button {
  background-color: #6200ea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.modal-button:hover {
  background-color: #5000c7;
}

.modal-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.reviews-list {
  margin-top: 1rem;
}

.review-item {
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-weight: bold;
}

.review-date {
  font-size: 0.9rem;
  color: #757575;
}

.review-rating {
  color: #ffc107;
  margin-bottom: 0.5rem;
}

.review-text {
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    margin-bottom: 90px;
  }
  
  .profile-picture-container {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .profile-info {
    justify-content: center;
    margin-left: 0;
  }
  
  .profile-profession {
    text-align: center;
    margin-left: 0;
  }
  
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 