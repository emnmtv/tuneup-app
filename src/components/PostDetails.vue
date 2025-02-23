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
        <div class="media-section">
          <div v-if="post.image" class="post-media">
            <img :src="post.image" :alt="post.title" class="post-image" />
          </div>
          <div v-if="post.video" class="post-media video-container">
      <video controls :src="post.video" class="post-video"></video>
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
            <button @click="initiatePayment" class="payment-btn" v-if="post.amount">
              <i class="material-icons">payment</i>
              Pay Now
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
import { fetchPostDetails, sendMessage } from '../authService.js';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      post: null,
      error: null,
      isModalOpen: false,
      messageContent: '',
    };
  },
  async created() {
    try {
      this.post = await fetchPostDetails(this.$route.params.postId);
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

.media-section {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
}

.post-image, .post-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style>
  