<template>
  <div class="verification-container">
    <h1 class="page-title">Creator Verification Requests</h1>
    
    <div class="status-card">
      <div class="card-content">
        <span class="number">{{ pendingRequests.length }}</span>
        <span class="label">Pending Requests</span>
      </div>
      <i class="material-icons status-icon">verified_user</i>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading verification requests...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <i class="material-icons error-icon">error</i>
      <p>{{ error }}</p>
      <button @click="fetchVerificationRequests" class="retry-button">
        <i class="material-icons">refresh</i>
        Retry
      </button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="pendingRequests.length === 0" class="empty-container">
      <i class="material-icons empty-icon">check_circle</i>
      <p>No pending verification requests</p>
    </div>
    
    <!-- Requests list -->
    <div v-else class="requests-list">
      <div v-for="request in pendingRequests" :key="request.id" class="request-card">
        <div class="request-header">
          <div class="user-info">
            <div class="avatar">
              <img v-if="request.user.profilePicture" :src="request.user.profilePicture" alt="Profile">
              <div v-else class="initials">{{ getInitials(request.user.firstName, request.user.lastName) }}</div>
            </div>
            <div class="user-details">
              <h3>{{ request.user.firstName }} {{ request.user.lastName }}</h3>
              <p class="profession">{{ request.profession || 'Creator' }}</p>
              <p class="email">{{ request.user.email }}</p>
              <p class="member-since">Member since: {{ formatDate(request.user.createdAt, false) }}</p>
            </div>
          </div>
          <div class="request-stats">
            <div class="stat-item">
              <i class="material-icons">article</i>
              <span>{{ request.user?.posts?.length || 0 }} Posts</span>
            </div>
            <div class="request-date">
              <i class="material-icons">calendar_today</i>
              <span>Requested: {{ formatDate(request.verificationRequestedAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="request-body">
          <div class="reason-section">
            <h4>Verification Reason:</h4>
            <p>{{ request.verificationReason || 'No reason provided' }}</p>
          </div>
          
          <div class="documents-section">
            <h4>Documents:</h4>
            <div class="document-links">
              <a 
                v-if="request.validIdDocument" 
                :href="request.validIdDocument" 
                target="_blank" 
                class="document-link"
              >
                <i class="material-icons">badge</i>
                View Valid ID
              </a>
              <a 
                v-if="request.portfolioFile" 
                :href="`${mediaBaseUrl}/uploads/documents/${request.portfolioFile}`" 
                target="_blank" 
                class="document-link"
              >
                <i class="material-icons">folder</i>
                View Portfolio
              </a>
              <a 
                v-if="request.resumeFile" 
                :href="`${mediaBaseUrl}/uploads/documents/${request.resumeFile}`" 
                target="_blank" 
                class="document-link"
              >
                <i class="material-icons">description</i>
                View Resume
              </a>
            </div>
          </div>
          
          <!-- Creator Posts Preview -->
          <div v-if="request.user?.posts && request.user.posts.length > 0" class="posts-section">
            <h4>Creator Posts ({{ request.user.posts.length }}):</h4>
            <div class="posts-grid">
              <div 
                v-for="post in request.user.posts.slice(0, 3)" 
                :key="post.id" 
                class="post-preview"
              >
                <div class="post-thumbnail" 
                     :style="post.image ? { backgroundImage: `url(${mediaBaseUrl}/uploads/${post.image})` } : {}"
                >
                  <div v-if="!post.image" class="no-image">
                    <i class="material-icons">photo</i>
                  </div>
                  <div class="post-status" :class="post.status">{{ post.status }}</div>
                </div>
                <div class="post-info">
                  <h5>{{ post.title }}</h5>
                  <p>{{ truncateText(post.description, 80) }}</p>
                  <p class="post-date">{{ formatDate(post.createdAt, false) }}</p>
                </div>
              </div>
            </div>
            <a 
              v-if="request.user.posts.length > 3" 
              :href="`/creator/${request.user.id}`" 
              target="_blank" 
              class="view-more"
            >
              View all {{ request.user.posts.length }} posts
            </a>
          </div>
          
          <div v-else class="no-posts">
            <i class="material-icons">article</i>
            <p>No posts created yet</p>
          </div>
        </div>
        
        <div class="request-actions">
          <button 
            @click="approveRequest(request.id)" 
            class="approve-button" 
            :disabled="processingIds.includes(request.id)"
          >
            <i class="material-icons">check_circle</i>
            Approve
          </button>
          <button 
            @click="showRejectDialog(request.id)" 
            class="reject-button" 
            :disabled="processingIds.includes(request.id)"
          >
            <i class="material-icons">cancel</i>
            Reject
          </button>
          <a 
            :href="`/creator/${request.user.id}`" 
            target="_blank" 
            class="view-profile-button"
          >
            <i class="material-icons">person</i>
            View Full Profile
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getPendingVerificationRequests, reviewVerificationRequest } from '../authService';
import { MEDIA_BASE_URL } from '../authService';
import Swal from 'sweetalert2';

export default {
  name: 'AdminVerification',
  setup() {
    const pendingRequests = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const processingIds = ref([]);
    const mediaBaseUrl = MEDIA_BASE_URL;
    
    const fetchVerificationRequests = async () => {
      try {
        loading.value = true;
        error.value = null;
        const result = await getPendingVerificationRequests();
        
        // Process and validate the data before assigning
        pendingRequests.value = (result.pendingRequests || []).map(request => {
          // Ensure user object exists
          if (!request.user) {
            request.user = { 
              firstName: 'Unknown', 
              lastName: 'User',
              posts: [] 
            };
          }
          
          // Ensure posts array exists
          if (!request.user.posts) {
            request.user.posts = [];
          }
          
          return request;
        });
      } catch (err) {
        console.error('Error fetching verification requests:', err);
        error.value = err.message || 'Failed to load verification requests';
      } finally {
        loading.value = false;
      }
    };
    
    const approveRequest = async (profileId) => {
      try {
        processingIds.value.push(profileId);
        
        // Confirmation dialog
        const result = await Swal.fire({
          title: 'Approve Verification',
          text: 'Are you sure you want to approve this creator for verification?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#4caf50',
          cancelButtonColor: '#f44336',
          confirmButtonText: 'Yes, Approve'
        });
        
        if (!result.isConfirmed) {
          processingIds.value = processingIds.value.filter(id => id !== profileId);
          return;
        }
        
        await reviewVerificationRequest(profileId, true);
        
        await Swal.fire({
          title: 'Approved!',
          text: 'Creator has been verified successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Remove from pending requests
        pendingRequests.value = pendingRequests.value.filter(req => req.id !== profileId);
      } catch (err) {
        console.error('Error approving verification:', err);
        Swal.fire({
          title: 'Error',
          text: err.message || 'Failed to approve verification',
          icon: 'error'
        });
      } finally {
        processingIds.value = processingIds.value.filter(id => id !== profileId);
      }
    };
    
    const showRejectDialog = async (profileId) => {
      try {
        processingIds.value.push(profileId);
        
        const { value: rejectionReason, isConfirmed } = await Swal.fire({
          title: 'Reject Verification',
          input: 'textarea',
          inputLabel: 'Please provide a reason for rejection',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: {
            'aria-label': 'Rejection reason'
          },
          showCancelButton: true,
          confirmButtonColor: '#f44336',
          cancelButtonColor: '#9e9e9e',
          confirmButtonText: 'Reject',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to provide a reason for rejection';
            }
          }
        });
        
        if (!isConfirmed) {
          processingIds.value = processingIds.value.filter(id => id !== profileId);
          return;
        }
        
        await reviewVerificationRequest(profileId, false, rejectionReason);
        
        await Swal.fire({
          title: 'Rejected',
          text: 'Verification request has been rejected',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Remove from pending requests
        pendingRequests.value = pendingRequests.value.filter(req => req.id !== profileId);
      } catch (err) {
        console.error('Error rejecting verification:', err);
        Swal.fire({
          title: 'Error',
          text: err.message || 'Failed to reject verification',
          icon: 'error'
        });
      } finally {
        processingIds.value = processingIds.value.filter(id => id !== profileId);
      }
    };
    
    const getInitials = (firstName, lastName) => {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };
    
    const formatDate = (dateString, includeTime = true) => {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: includeTime ? '2-digit' : undefined,
        minute: includeTime ? '2-digit' : undefined
      });
      return formattedDate.replace(',', '');
    };
    
    const truncateText = (text, maxLength) => {
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
      }
      return text;
    };
    
    onMounted(fetchVerificationRequests);
    
    return {
      pendingRequests,
      loading,
      error,
      processingIds,
      mediaBaseUrl,
      fetchVerificationRequests,
      approveRequest,
      showRejectDialog,
      getInitials,
      formatDate,
      truncateText
    };
  }
};
</script>

<style scoped>
.verification-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
}

.status-card {
  background: linear-gradient(135deg, #42b0ff, #4a6bff);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-content .number {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
}

.card-content .label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.status-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.loading-container, .error-container, .empty-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a6bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-icon {
  color: #f44336;
}

.empty-icon {
  color: #4caf50;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.3s;
}

.retry-button:hover {
  background: #1976d2;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.request-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.request-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.request-header {
  padding: 1.5rem;
  background: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.user-details h3 {
  margin: 0;
  font-size: 1.2rem;
}

.profession {
  margin: 5px 0;
  color: #666;
}

.email {
  margin: 0;
  color: #2196f3;
  font-size: 0.9rem;
}

.request-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.request-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.request-body {
  padding: 1.5rem;
}

.reason-section, .documents-section {
  margin-bottom: 1.5rem;
}

.reason-section h4, .documents-section h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.document-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.document-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.document-link:hover {
  background: #e0e0e0;
}

.request-actions {
  display: flex;
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  gap: 1rem;
}

.approve-button, .reject-button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.approve-button {
  background: #4caf50;
  color: white;
}

.approve-button:hover:not(:disabled) {
  background: #388e3c;
}

.reject-button {
  background: #f44336;
  color: white;
}

.reject-button:hover:not(:disabled) {
  background: #d32f2f;
}

.approve-button:disabled, .reject-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.posts-section {
  margin-bottom: 1.5rem;
}

.posts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.post-preview {
  width: calc(33.33% - 1rem);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.post-thumbnail {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 4px;
}

.post-status {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 0 0 4px 0;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.post-status.approved {
  background-color: rgba(76, 175, 80, 0.8);
}

.post-status.pending {
  background-color: rgba(255, 193, 7, 0.8);
}

.post-status.rejected {
  background-color: rgba(244, 67, 54, 0.8);
}

.post-info {
  text-align: center;
  margin-top: 0.5rem;
}

.post-info h5 {
  margin: 0;
  font-size: 1rem;
}

.post-info p {
  margin: 0;
  font-size: 0.9rem;
}

.view-more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.view-more:hover {
  background: #1976d2;
}

.no-posts {
  text-align: center;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.view-profile-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.view-profile-button:hover {
  background: #1976d2;
}

.member-since {
  margin: 5px 0 0 0;
  color: #777;
  font-size: 0.85rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
}

.post-date {
  color: #777;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .verification-container {
    padding: 1rem;
  }
  
  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .request-stats {
    align-items: flex-start;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }
  
  .document-links {
    flex-direction: column;
  }
  
  .posts-grid {
    flex-direction: column;
  }
  
  .post-preview {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .request-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .approve-button, .reject-button, .view-profile-button {
    width: 100%;
  }
}
</style>
