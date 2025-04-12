<template>
  <div v-if="post" class="post-details-container">
    <!-- Back Navigation -->
    <div class="back-nav">
      <button @click="handleBack" class="back-button">
        <i class="material-icons">arrow_back</i>
        Back
      </button>
    </div>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Left Column: Media and Description -->
      <div class="left-column">
        <!-- Main Media Display -->
        <div class="main-media-section">
          <!-- Main Image -->
          <div v-if="currentMedia.type === 'image'" class="main-media">
            <img :src="currentMedia.url" :alt="post.title" class="main-image" />
          </div>
          
          <!-- Main Video -->
          <div v-if="currentMedia.type === 'video'" class="main-media video-container">
            <video 
              controls 
              :src="currentMedia.url" 
              class="main-video"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <!-- Media Gallery -->
        <div class="media-gallery" v-if="hasMultipleMedia">
          <!-- Image Thumbnail -->
          <div 
            v-if="post.image" 
            :class="['media-thumbnail', { active: currentMedia.url === post.image }]"
            @click="setCurrentMedia('image', post.image)"
          >
            <img :src="post.image" alt="Post image" />
          </div>
          
          <!-- Video Thumbnail -->
          <div 
            v-if="post.video" 
            :class="['media-thumbnail', { active: currentMedia.url === post.video }]"
            @click="setCurrentMedia('video', post.video)"
          >
            <!-- Use video element itself as thumbnail -->
            <video 
              :src="post.video" 
              preload="metadata"
            >
              Your browser does not support video thumbnails.
            </video>
            <div class="video-indicator">
              <i class="material-icons">play_circle</i>
            </div>
          </div>
        </div>

        <div class="post-info">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="price-tag" v-if="post.amount">
            ₱{{ formatAmount(post.amount) }}
    </div>

          <div class="description-section">
            <h3>Description</h3>
            <p class="description">{{ post.description }}</p>
            <div v-if="post.detailedDescription" class="detailed-description">
              <h3>Detailed Information</h3>
              <p>{{ post.detailedDescription }}</p>
            </div>
            <div v-if="post.remarks" class="remarks">
              <h3>Additional Remarks</h3>
              <p>{{ post.remarks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Creator Info and Actions -->
      <div class="right-column">
        <div class="creator-card">
          <div class="creator-header">
            <div class="creator-avatar">
              {{ getInitials(post.user.firstName, post.user.lastName) }}
            </div>
            <div class="creator-info">
              <h2>{{ post.user.firstName }} {{ post.user.lastName }}</h2>
              <span class="creator-role">{{ post.user.role }}</span>
              <div class="verification-badge" v-if="post.user.verified">
                <i class="material-icons">verified</i>
                Verified Creator
              </div>
            </div>
          </div>

          <div class="creator-details">
            <div class="detail-item" v-if="post.user.creatorProfile?.typeOfProfession">
              <i class="material-icons">category</i>
              <div class="detail-text">
                <span class="detail-label">Type of Profession</span>
                <span class="detail-value">{{ post.user.creatorProfile.typeOfProfession }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.profession">
              <i class="material-icons">work</i>
              <div class="detail-text">
                <span class="detail-label">Profession</span>
                <span class="detail-value">{{ post.user.creatorProfile.profession }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.genre">
              <i class="material-icons">music_note</i>
              <div class="detail-text">
                <span class="detail-label">Genre</span>
                <span class="detail-value">{{ post.user.creatorProfile.genre }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.specialization">
              <i class="material-icons">stars</i>
              <div class="detail-text">
                <span class="detail-label">Specialization</span>
                <span class="detail-value">{{ post.user.creatorProfile.specialization }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.experience">
              <i class="material-icons">timeline</i>
              <div class="detail-text">
                <span class="detail-label">Experience</span>
                <span class="detail-value">{{ post.user.creatorProfile.experience }} years</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.availability">
              <i class="material-icons">schedule</i>
              <div class="detail-text">
                <span class="detail-label">Availability</span>
                <span class="detail-value">{{ post.user.creatorProfile.availability }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.ratePerHour">
              <i class="material-icons">payments</i>
              <div class="detail-text">
                <span class="detail-label">Rate per Hour</span>
                <span class="detail-value">₱{{ formatAmount(post.user.creatorProfile.ratePerHour) }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.equipment">
              <i class="material-icons">music_note</i>
              <div class="detail-text">
                <span class="detail-label">Equipment</span>
                <span class="detail-value">{{ post.user.creatorProfile.equipment }}</span>
              </div>
            </div>

            <div class="detail-item" v-if="post.user.creatorProfile?.portfolio">
              <i class="material-icons">link</i>
              <div class="detail-text">
                <span class="detail-label">Portfolio</span>
                <a :href="post.user.creatorProfile.portfolio" 
                   target="_blank" 
                   class="portfolio-link">
                  View Portfolio
                </a>
              </div>
            </div>
          </div>

          <div class="creator-bio" v-if="post.user.creatorProfile?.bio">
            <h3>About</h3>
            <p>{{ post.user.creatorProfile.bio }}</p>
          </div>

          <div class="creator-offers" v-if="post.user.creatorProfile?.offers">
            <h3>Services Offered</h3>
            <div class="offers-tags">
              <span v-for="offer in getOffers(post.user.creatorProfile.offers)" 
                    :key="offer" 
                    class="offer-tag">
                {{ offer }}
              </span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="openMessageModal" class="message-btn">
              <i class="material-icons">chat</i>
              Send Message
            </button>
          
          </div>
    </div>

        <div class="post-metadata">
          <div class="metadata-item">
            <i class="material-icons">schedule</i>
            <span>Posted {{ formatTimeAgo(post.createdAt) }}</span>
          </div>
          <div class="metadata-item" v-if="isUpdated(post.createdAt, post.updatedAt)">
            <i class="material-icons">update</i>
            <span>Updated {{ formatTimeAgo(post.updatedAt) }}</span>
          </div>
        </div>

        <!-- Add this section for creator ratings -->
        <div class="creator-ratings" v-if="creatorRatings">
          <h3>Creator Ratings</h3>
          <div class="rating-stats">
            <div class="average-rating">
              <div class="rating-value">{{ creatorRatings.stats.average.toFixed(1) }}</div>
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="material-icons"
                  :class="{ filled: star <= Math.round(creatorRatings.stats.average) }"
                >
                  star
                </span>
              </div>
              <div class="total-ratings">{{ creatorRatings.stats.total }} ratings</div>
            </div>
          </div>

          <!-- Recent Reviews -->
          <div class="recent-reviews">
            <h4>Recent Reviews</h4>
            <div v-if="creatorRatings.ratings.length > 0" class="reviews-list">
              <div v-for="rating in creatorRatings.ratings.slice(0, 5)" :key="rating.id" class="review-item">
                <div class="review-header">
                  <div class="stars">
                    <span 
                      v-for="star in 5" 
                      :key="star"
                      class="material-icons"
                      :class="{ filled: star <= rating.rating }"
                    >
                      star
                    </span>
                  </div>
                  <div class="review-date">{{ formatDate(rating.createdAt) }}</div>
                </div>
                <div class="reviewer">{{ rating.client.firstName }} {{ rating.client.lastName }}</div>
                <div class="review-text" v-if="rating.review">{{ rating.review }}</div>
                <div class="service-info">
                  <span class="material-icons">check_circle</span>
                  {{ rating.payment.description }}
                </div>
              </div>
            </div>
            <div v-else class="no-reviews">
              No reviews yet
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeMessageModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Message {{ post.user.firstName }}</h2>
          <button class="close-btn" @click="closeMessageModal">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="messageContent" 
            placeholder="Type your message here..."
            rows="5"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeMessageModal">Cancel</button>
          <button 
            class="send-btn" 
            @click="sendMessage"
            :disabled="!messageContent.trim()"
          >
            <i class="material-icons">send</i>
            Send
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading post details...</p>
  </div>
</template>

<script>
import { fetchPostDetails, sendMessage, fetchCreatorRatingsById } from '../authService.js';
import Swal from 'sweetalert2';
import { ref } from 'vue';

export default {
  data() {
    return {
      post: null,
      error: null,
      isModalOpen: false,
      messageContent: '',
      showMediaPreview: ref(false),
      previewType: ref(null),
      currentMedia: {
        type: null,
        url: null
      },
      creatorRatings: null
    };
  },
  computed: {
    hasMultipleMedia() {
      return (this.post?.image && this.post?.video) || 
             (Array.isArray(this.post?.images) && this.post?.images.length > 0);
    }
  },
  async created() {
    try {
      this.post = await fetchPostDetails(this.$route.params.postId);
      // Set initial media
      if (this.post.video) {
        this.setCurrentMedia('video', this.post.video);
      } else if (this.post.image) {
        this.setCurrentMedia('image', this.post.image);
      }
      await this.fetchRatings();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load post details',
      });
      console.error("Error fetching post details:", error);
    }
  },
  methods: {
    formatAmount(amount) {
      return Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    getInitials(firstName, lastName) {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    },
    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      let interval = Math.floor(seconds / 31536000);
      if (interval > 1) return `${interval} years ago`;
      if (interval === 1) return 'a year ago';

      interval = Math.floor(seconds / 2592000);
      if (interval > 1) return `${interval} months ago`;
      if (interval === 1) return 'a month ago';

      interval = Math.floor(seconds / 86400);
      if (interval > 1) return `${interval} days ago`;
      if (interval === 1) return 'yesterday';

      interval = Math.floor(seconds / 3600);
      if (interval > 1) return `${interval} hours ago`;
      if (interval === 1) return 'an hour ago';

      interval = Math.floor(seconds / 60);
      if (interval > 1) return `${interval} minutes ago`;
      if (interval === 1) return 'a minute ago';

      return 'just now';
    },
    isUpdated(created, updated) {
      return new Date(updated) - new Date(created) > 1000;
    },
    getOffers(offersString) {
      return offersString.split(',').map(offer => offer.trim());
    },
    async openMessageModal() {
      if (!localStorage.getItem('token')) {
        const result = await Swal.fire({
          title: 'Login Required',
          text: 'You need to be logged in to send messages',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          this.$router.push('/login');
        }
        return;
      }
      this.isModalOpen = true;
    },
    closeMessageModal() {
      this.isModalOpen = false;
      this.messageContent = '';
    },
    async sendMessage() {
      try {
        await sendMessage(this.post.user.id, this.messageContent);
        this.closeMessageModal();
        Swal.fire({
          icon: 'success',
          title: 'Message Sent',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send message'
        });
      }
    },
    async initiatePayment() {
      if (!localStorage.getItem('token')) {
        const result = await Swal.fire({
          title: 'Login Required',
          text: 'You need to be logged in to make payments',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          this.$router.push('/login');
        }
        return;
      }
      // Implement payment logic here
    },
    handleBack() {
      // Check if we have a previous route in the same session
      if (this.$router.options.history.state.back) {
        this.$router.go(-1);
      } else {
        // If no previous route, go to dashboard for logged-in users, or landing for others
        const isLoggedIn = !!localStorage.getItem('token');
        this.$router.push(isLoggedIn ? '/dashboard' : '/');
      }
    },
    setCurrentMedia(type, url) {
      this.currentMedia = { type, url };
    },
    async fetchRatings() {
      try {
        if (this.post && this.post.user && this.post.user.id) {
          const ratings = await fetchCreatorRatingsById(this.post.user.id);
          this.creatorRatings = ratings;
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.post-details-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f5f7fb;
}

.back-nav {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.back-button:hover {
  color: #333;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.left-column {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-media-section {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  margin-bottom: 1rem;
}

.main-media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image,
.main-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.media-gallery {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem;
  margin-top: 1rem;
}

.media-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.media-thumbnail.active {
  border-color: #2196f3;
}

.media-thumbnail img,
.media-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Prevent video from playing in thumbnail */
  pointer-events: none;
}

.video-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 0.5rem;
  z-index: 2;
}

.video-indicator i {
  font-size: 24px;
}

.media-thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Make sure thumbnails scroll smoothly on mobile */
@media (max-width: 768px) {
  .media-gallery {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .media-gallery::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.post-info {
  padding: 2rem;
  }
  
  .post-title {
    font-size: 2rem;
  margin: 0 0 1rem;
  color: #333;
}

.price-tag {
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.description-section h3 {
  color: #666;
  margin: 1.5rem 0 0.5rem;
}

.description {
  line-height: 1.6;
  color: #333;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.creator-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.creator-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.creator-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2196f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.creator-info h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.creator-role {
  color: #666;
  font-size: 0.9rem;
}

.verification-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #2196f3;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.creator-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
}

.detail-value {
  font-size: 1rem;
  color: #333;
}

.creator-bio h3,
.creator-offers h3 {
  color: #666;
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.creator-bio p {
  color: #333;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.offers-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.offer-tag {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.message-btn,
.payment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-btn {
  background: #2196f3;
  color: white;
}

.payment-btn {
  background: #4caf50;
  color: white;
}

.message-btn:hover {
  background: #1976d2;
}

.payment-btn:hover {
  background: #43a047;
}

.post-metadata {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn,
.send-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.send-btn {
  background: #2196f3;
  color: white;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #666;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .post-details-container {
    padding: 1rem;
  }

  .post-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}

.portfolio-link {
  color: #2196f3;
  text-decoration: none;
}

.portfolio-link:hover {
  text-decoration: underline;
}

.video-container {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.post-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Optional: Add a media preview modal */
.media-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.media-preview img,
.media-preview video {
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
}

.creator-ratings {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rating-stats {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.average-rating {
  text-align: center;
}

.rating-value {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
}

.stars {
  color: #ffd700;
  margin: 0.5rem 0;
}

.stars .material-icons {
  font-size: 1.25rem;
}

.stars .material-icons.filled {
  color: #ffd700;
}

.total-ratings {
  color: #666;
  font-size: 0.9rem;
}

.recent-reviews {
  margin-top: 2rem;
}

.reviews-list {
  margin-top: 1rem;
}

.review-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-date {
  color: #666;
  font-size: 0.9rem;
}

.reviewer {
  font-weight: 500;
  margin: 0.5rem 0;
}

.review-text {
  color: #2c3e50;
  margin: 0.5rem 0;
  font-style: italic;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
}

.no-reviews {
  text-align: center;
  color: #666;
  padding: 2rem;
}
</style>
  