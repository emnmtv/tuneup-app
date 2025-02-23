<template>
  <div class="creator-dashboard">
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
            <span>{{ user.creatorProfile.profession }}</span>
          </div>
        </div>
        <div class="info-item">
          <i class="material-icons">music_note</i>
          <div class="info-text">
            <label>Genre</label>
            <span>{{ user.creatorProfile.genre }}</span>
          </div>
        </div>
        <div class="info-item">
          <i class="material-icons">list</i>
          <div class="info-text">
            <label>Services Offered</label>
            <span>{{ user.creatorProfile.offers }}</span>
          </div>
        </div>
        <div class="info-item full-width">
          <i class="material-icons">person</i>
          <div class="info-text">
            <label>Bio</label>
            <p>{{ user.creatorProfile.bio }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts Section -->
    <div v-if="user?.posts?.length" class="posts-section">
      <div class="section-header">
        <h2>Your Posts</h2>
        <router-link to="/create-post" class="new-post-btn">
          <i class="material-icons">add</i>
          New Post
        </router-link>
      </div>

      <div class="posts-grid">
        <div v-for="post in user.posts" :key="post.id" class="post-card">
          <!-- Post Media -->
          <div class="post-media">
            <img v-if="post.image" :src="post.image" :alt="post.title" class="post-image" />
            <video v-if="post.video" :src="post.video" controls class="post-video"></video>
          </div>

          <!-- Post Content -->
          <div class="post-content" v-if="!post.isEditing">
            <h3>{{ post.title }}</h3>
            <p class="description">{{ post.description }}</p>
            <div v-if="post.amount" class="amount">₱{{ formatAmount(post.amount) }}</div>
          </div>

          <!-- Edit Form -->
          <div v-else class="edit-form">
            <input v-model="post.editedTitle" placeholder="Title" />
            <textarea v-model="post.editedDescription" placeholder="Description"></textarea>
            <textarea 
              v-model="post.editedDetailedDescription" 
              placeholder="Detailed Description"
            ></textarea>
            <input 
              v-model="post.editedAmount" 
              type="number" 
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
    <div v-else class="empty-state">
      <i class="material-icons">post_add</i>
      <h3>No Posts Yet</h3>
      <p>Start sharing your content with the community</p>
      <router-link to="/create-post" class="create-first-post-btn">
        Create Your First Post
      </router-link>
    </div>
  </div>
</template>

<script>
import { fetchUserProfileAndPosts, editPost, deletePost } from '../authService';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      user: null,
    };
  },
  methods: {
    getInitials(firstName, lastName) {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString();
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
      const userData = await fetchUserProfileAndPosts();
      this.user = userData;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile data',
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

.creator-info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-media {
  height: 200px;
  overflow: hidden;
}

.post-image,
.post-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-content h3 {
  margin: 0 0 0.5rem 0;
}

.description {
  color: #666;
  margin-bottom: 1rem;
}

.amount {
  font-weight: 600;
  color: #2196f3;
}

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
}

.edit-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.delete-btn {
  background: #ffebee;
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
</style>