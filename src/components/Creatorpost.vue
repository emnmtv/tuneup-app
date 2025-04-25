<template>
  <div class="creator-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your creator profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="material-icons error-icon">error_outline</i>
      <h3>Failed to load profile</h3>
      <p>{{ error }}</p>
      <button @click="reloadData" class="retry-button">
        <i class="material-icons">refresh</i> Retry
      </button>
    </div>

    <!-- Content (only shown when not loading and no error) -->
    <template v-else>
      <!-- Creator Profile Header -->
      <div class="profile-header" v-if="user">
        <div class="profile-info">
          <div class="avatar">
            {{ getInitials(user.firstName, user.lastName) }}
          </div>
          <div class="user-details">
            <h1>{{ user.firstName }} {{ user.lastName }}</h1>
            <span class="role-badge">Creator</span>
          </div>
        </div>
        
        <!-- Creator Stats -->
        <div class="creator-stats">
          <div class="stat-card">
            <i class="material-icons">post_add</i>
            <div class="stat-info">
              <span class="stat-value">{{ user.posts?.length || 0 }}</span>
              <span class="stat-label">Total Posts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Creator Profile Info -->
      <div v-if="user?.creatorProfile" class="creator-info-card">
        <div class="info-header">
          <h2>Profile Information</h2>
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="material-icons">work</i>
            <div class="info-text">
              <label>Profession</label>
              <span>{{ user.creatorProfile.profession || 'Not specified' }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="material-icons">music_note</i>
            <div class="info-text">
              <label>Genre</label>
              <span>{{ user.creatorProfile.genre || 'Not specified' }}</span>
            </div>
          </div>
          <div class="info-item">
            <i class="material-icons">list</i>
            <div class="info-text">
              <label>Services Offered</label>
              <span>{{ user.creatorProfile.offers || 'Not specified' }}</span>
            </div>
          </div>
          <div class="info-item full-width">
            <i class="material-icons">person</i>
            <div class="info-text">
              <label>Bio</label>
              <p>{{ user.creatorProfile.bio || 'No bio provided' }}</p>
            </div>
          </div>
          <!-- Creator Level Display -->
          <div class="info-item">
            <i class="material-icons">star</i>
            <div class="info-text">
              <label>Creator Level</label>
              <div class="creator-level">
                <div class="star-rating">
                  <i v-for="n in 5" :key="n" class="material-icons" 
                    :class="{ 'star-filled': n <= Math.round(user.creatorProfile.creatorLevel || 0) }">
                    star
                  </i>
                </div>
                <span class="rating-value">{{ (user.creatorProfile.creatorLevel || 0).toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts Section -->
      <div v-if="user?.posts?.length" class="posts-section">
        <div class="section-header">
          <h2>Your Posts</h2>
          <router-link to="/createpost" class="new-post-btn">
            <i class="material-icons">add</i>
            New Post
          </router-link>
        </div>

        <div class="posts-grid">
          <div v-for="post in user.posts" :key="post.id" class="post-card">
            <!-- Post Media -->
            <div class="post-media">
              <div v-if="post.image" class="media-container image-container">
                <img :src="post.image" :alt="post.title" class="post-image" />
              </div>
              
              <div v-if="post.video" class="media-container video-container">
                <video :src="post.video" controls class="post-video"></video>
                <div class="media-type-badge"><i class="material-icons">videocam</i></div>
              </div>
              
              <div v-if="post.audio" class="media-container audio-container">
                <div class="audio-visualization">
                  <div class="wave-bar" v-for="i in 16" :key="i" 
                    :style="{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.1}s` }">
                  </div>
                </div>
                <audio 
                  :src="post.audio" 
                  controls 
                  class="post-audio"
                  @play="post.isPlaying = true" 
                  @pause="post.isPlaying = false"
                  @ended="post.isPlaying = false">
                </audio>
                <div class="media-type-badge"><i class="material-icons">audiotrack</i></div>
              </div>
              
              <div v-if="!post.image && !post.video && !post.audio" class="media-container empty-media">
                <i class="material-icons">description</i>
                <span>No media</span>
              </div>
            </div>

            <!-- Copyright Info Alert -->
            <div v-if="post.copyrightInfo && post.copyrightInfo.isDetected" class="copyright-alert">
              <div class="copyright-icon">
                <i class="material-icons">copyright</i>
              </div>
              <div class="copyright-content">
                <span class="copyright-title">Copyright Detected</span>
                <p>{{ post.copyrightInfo.songInfo.title }} by {{ post.copyrightInfo.songInfo.artist }}</p>
              </div>
            </div>

            <!-- Post Content -->
            <div class="post-content" v-if="!post.isEditing">
              <div class="post-header">
                <h3>{{ post.title }}</h3>
                <span class="post-status" :class="post.status">{{ post.status }}</span>
              </div>
              <p class="description">{{ post.description }}</p>
              <div v-if="post.detailedDescription" class="detailed-description">
                <button @click="post.showDetails = !post.showDetails" class="toggle-details-btn">
                  <i class="material-icons">{{ post.showDetails ? 'expand_less' : 'expand_more' }}</i>
                  {{ post.showDetails ? 'Hide Details' : 'Show Details' }}
                </button>
                <div v-if="post.showDetails" class="detailed-content">
                  {{ post.detailedDescription }}
                </div>
              </div>
              <div class="post-meta">
                <div v-if="post.amount" class="amount">₱{{ formatAmount(post.amount) }}</div>
                <div class="post-date">Posted {{ formatDate(post.createdAt) }}</div>
              </div>
            </div>

            <!-- Edit Form -->
            <div v-else class="edit-form">
              <input 
                v-model="post.editedTitle" 
                placeholder="Title"
                required 
              />
              <textarea 
                v-model="post.editedDescription" 
                placeholder="Description"
                required
              ></textarea>
              <textarea 
                v-model="post.editedDetailedDescription" 
                placeholder="Detailed Description"
              ></textarea>
              <input 
                v-model="post.editedAmount" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="Amount"
              />
              <input 
                v-model="post.editedRemarks" 
                placeholder="Remarks"
              />
              
              <!-- Media Upload -->
              <div class="media-upload">
                <label class="upload-label">
                  <i class="material-icons">image</i>
                  Change Image
                  <input 
                    type="file" 
                    @change="handleImageUpload(post, $event)" 
                    accept="image/*" 
                    class="file-input"
                  />
                </label>
                <label class="upload-label">
                  <i class="material-icons">videocam</i>
                  Change Video
                  <input 
                    type="file" 
                    @change="handleVideoUpload(post, $event)" 
                    accept="video/*"
                    class="file-input"
                  />
                </label>
                <label class="upload-label">
                  <i class="material-icons">audiotrack</i>
                  Change Audio
                  <input 
                    type="file" 
                    @change="handleAudioUpload(post, $event)" 
                    accept="audio/*"
                    class="file-input"
                  />
                </label>
                <div class="file-size-warning" v-if="showAudioWarning">
                  <i class="material-icons warning-icon">warning</i>
                  Maximum audio file size: 20MB. Please compress larger files before uploading.
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="post-actions">
              <button 
                v-if="!post.isEditing" 
                @click="startEditing(post)" 
                class="edit-btn"
              >
                <i class="material-icons">edit</i>
                Edit
              </button>
              <button 
                v-else 
                @click="savePost(post)" 
                class="save-btn"
                :disabled="!post.editedTitle || !post.editedDescription"
              >
                <i class="material-icons">save</i>
                Save
              </button>
              <button 
                @click="confirmDelete(post.id)" 
                class="delete-btn"
              >
                <i class="material-icons">delete</i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="user" class="empty-state">
        <i class="material-icons">post_add</i>
        <h3>No Posts Yet</h3>
        <p>Start sharing your content with the community</p>
        <router-link to="/createpost" class="create-first-post-btn">
          Create Your First Post
        </router-link>
      </div>
    </template>
  </div>
</template>

<script>
import { fetchUserProfileAndPosts, editPost, deletePost } from '../authService';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      user: null,
      showAudioWarning: false,
      loading: true,
      error: null,
    };
  },
  methods: {
    getInitials(firstName, lastName) {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString();
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },
    async reloadData() {
      this.loading = true;
      this.error = null;
      try {
        await this.created();
      } catch (error) {
        // Error is handled in created()
      }
    },
    async startEditing(post) {
      post.isEditing = true;
      post.editedTitle = post.title;
      post.editedDescription = post.description;
      post.editedDetailedDescription = post.detailedDescription;
      post.editedAmount = post.amount;
      post.editedRemarks = post.remarks;
      post.newImage = null;
      post.newVideo = null;
      post.newAudio = null;
    },
    handleImageUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        post.newImage = file;
      }
    },
    handleVideoUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        post.newVideo = file;
      }
    },
    handleAudioUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        // Check file size - limit to 20MB
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (file.size > maxSize) {
          this.showAudioWarning = true;
          Swal.fire({
            title: 'File Too Large',
            text: 'Audio file exceeds the 20MB limit. Please compress the file or choose a smaller one.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          event.target.value = ''; // Reset the input
          return;
        }
        
        this.showAudioWarning = false;
        post.newAudio = file;
      }
    },
    async savePost(post) {
      try {
        const result = await Swal.fire({
          title: 'Save Changes?',
          text: 'Are you sure you want to update this post?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, save changes',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#2196f3',
          cancelButtonColor: '#666'
        });

        if (!result.isConfirmed) return;

        const postData = {
          postId: post.id,
          title: post.editedTitle,
          description: post.editedDescription,
          detailedDescription: post.editedDetailedDescription,
          amount: post.editedAmount,
          remarks: post.editedRemarks,
          image: post.newImage,
          video: post.newVideo,
          audio: post.newAudio,
        };

        const updatedPost = await editPost(post.id, postData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Post Updated!',
          text: 'Your post has been updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        post.isEditing = false;
        Object.assign(post, updatedPost);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.message || 'Failed to update post',
        });
      }
    },
    async confirmDelete(postId) {
      const result = await Swal.fire({
        title: 'Delete Post?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#666'
      });

      if (result.isConfirmed) {
        await this.deletePost(postId);
      }
    },
    async deletePost(postId) {
      try {
        await deletePost(postId);
        this.user.posts = this.user.posts.filter(post => post.id !== postId);
        
        await Swal.fire({
          icon: 'success',
          title: 'Post Deleted',
          text: 'Your post has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.message || 'Failed to delete post',
        });
      }
    },
  },
  async created() {
    try {
      // Show loading state
      this.loading = true;
      const userData = await fetchUserProfileAndPosts();
      
      // Process post data to properly handle audio files and copyright info
      if (userData && userData.posts) {
        userData.posts = userData.posts.map(post => {
          // Parse copyright info if it exists as a string
          if (post.copyrightInfo && typeof post.copyrightInfo === 'string') {
            try {
              post.copyrightInfo = JSON.parse(post.copyrightInfo);
            } catch (e) {
              console.error('Error parsing copyright info:', e);
              post.copyrightInfo = null;
            }
          }
          
          // Add UI state properties
          return {
            ...post,
            isEditing: false,
            isPlaying: false
          };
        });
      }
      
      this.user = userData;
      this.loading = false;
    } catch (error) {
      console.error('Error fetching user data:', error);
      this.loading = false;
      this.error = error.message || 'Failed to load profile data';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.error,
      });
    }
  },
};
</script>

<style scoped>
.creator-dashboard {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(33, 150, 243, 0.1);
  border-radius: 50%;
  border-left-color: #2196f3;
  animation: spinner 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  margin-top: 1.5rem;
}

.retry-button:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  background: white;
  color: #2196f3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.role-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.creator-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Creator Info Card */
.creator-info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.info-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.info-content {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  gap: 1rem;
}

.full-width {
  grid-column: 1 / -1;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-text label {
  color: #666;
  font-size: 0.9rem;
}

/* Star Rating */
.creator-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.star-rating {
  display: flex;
}

.star-rating .material-icons {
  color: #e0e0e0;
  font-size: 1.2rem;
}

.star-rating .star-filled {
  color: #ffc107;
}

.rating-value {
  font-weight: 500;
  color: #333;
}

/* Posts Section */
.posts-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.new-post-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
}

.new-post-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Post Card */
.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Media Containers */
.media-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Audio Container */
.audio-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #1a237e, #3f51b5);
  color: white;
}

.audio-visualization {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100px;
  margin-bottom: 1rem;
  gap: 3px;
}

.wave-bar {
  width: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
  transition: height 0.3s;
}

.post-audio {
  width: 100%;
  height: 36px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
}

/* Empty Media */
.empty-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #757575;
  gap: 0.5rem;
}

.empty-media .material-icons {
  font-size: 3rem;
  opacity: 0.5;
}

/* Copyright Alert */
.copyright-alert {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
}

.copyright-icon {
  color: #ffc107;
  margin-right: 0.8rem;
}

.copyright-title {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

/* Post Content */
.post-content {
  padding: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-header h3 {
  margin: 0;
}

.post-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.post-status.pending {
  background-color: #ffe0b2;
  color: #e65100;
}

.post-status.approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.post-status.rejected {
  background-color: #ffebee;
  color: #c62828;
}

.description {
  color: #666;
  margin-bottom: 1rem;
}

.detailed-description {
  margin: 1rem 0;
}

.toggle-details-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.detailed-content {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.amount {
  font-weight: 600;
  color: #2196f3;
}

.post-date {
  font-size: 0.8rem;
  color: #9e9e9e;
}

/* Edit Form */
.edit-form {
  padding: 1.5rem;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-family: inherit;
  font-size: 1rem;
}

.edit-form textarea {
  min-height: 100px;
  resize: vertical;
}

.media-upload {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  color: #666;
}

.upload-label:hover {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.file-input {
  display: none;
}

/* Post Actions */
.post-actions {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.save-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.edit-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.save-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.delete-btn {
  background: #ffebee;
  color: #f44336;
}

.edit-btn:hover,
.save-btn:hover:not(:disabled),
.delete-btn:hover {
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 4rem;
  color: #2196f3;
  margin-bottom: 1rem;
}

.create-first-post-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: all 0.3s;
}

.create-first-post-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

/* File Warning */
.file-size-warning {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fff8e1;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  border-left: 3px solid #ffc107;
}

.warning-icon {
  color: #f57c00;
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .profile-info {
    flex-direction: column;
  }

  .info-content {
    grid-template-columns: 1fr;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .media-upload {
    grid-template-columns: 1fr;
  }

  .post-actions {
    flex-direction: column;
  }

  .edit-btn,
  .save-btn,
  .delete-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes wave {
  0% { height: 20%; }
  50% { height: 60%; }
  100% { height: 20%; }
}
</style>