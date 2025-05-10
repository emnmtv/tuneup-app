<template>
  <div class="admin-review-container">
    <h1 class="page-title">
      <i class="material-icons">gavel</i>
      User Restrictions &amp; Review
    </h1>
    
    <div class="page-description">
      <p>Manage users who have accumulated copyright strikes or have active restrictions.</p>
    </div>
    
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ usersUnderReview.length }}</div>
        <div class="stat-label">Users Under Review</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ usersWithRestrictions.length }}</div>
        <div class="stat-label">Users With Restrictions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalCopyrightStrikes }}</div>
        <div class="stat-label">Total Copyright Strikes</div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
    
    <div v-else-if="usersUnderReview.length === 0 && usersWithRestrictions.length === 0" class="empty-state">
      <i class="material-icons">check_circle</i>
      <h3>No users currently under review or restricted</h3>
      <p>All copyright issues have been handled. Great job!</p>
    </div>
    
    <div v-if="usersWithRestrictions.length > 0" class="section-title">
      <h2>Users With Active Restrictions</h2>
    </div>
    
    <div class="users-review-list">
      <div 
        v-for="user in usersWithRestrictions" 
        :key="`restricted-${user.id}`"
        class="user-review-card"
      >
        <div class="user-review-header">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials(user) }}</div>
            <div class="user-details">
              <h3>{{ user.firstName }} {{ user.lastName }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-meta">
                <span class="user-role">{{ user.role }}</span>
                <span class="strike-count">
                  <i class="material-icons">copyright</i> 
                  {{ user.copyrightStrikes }} strikes
                </span>
                <span class="join-date">
                  Joined {{ formatDate(user.createdAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="review-status">
            <span 
              class="status-badge" 
              :class="user.restrictionType === 'warning' ? 'warning' : 'danger'"
            >
              <i class="material-icons">{{ user.restrictionType === 'warning' ? 'warning' : 'block' }}</i>
              {{ user.restrictionType === 'warning' ? 'Warning' : 'Suspended' }} 
              <span v-if="user.restrictionExpiresAt">
                until {{ formatDate(user.restrictionExpiresAt) }}
              </span>
            </span>
          </div>
        </div>
        
        <div v-if="user.creatorProfile" class="creator-info">
          <h4>Creator Profile</h4>
          <p><strong>Profession:</strong> {{ user.creatorProfile.profession || 'Not specified' }}</p>
          <p v-if="user.creatorProfile.bio" class="creator-bio">{{ truncateBio(user.creatorProfile.bio) }}</p>
        </div>
        
        <div class="admin-actions">
          <h4>Take Action</h4>
          <div class="action-buttons">
            <button 
              class="action-btn clear" 
              @click="handleUserAction(user.id, 'clear')"
              :disabled="isProcessing"
            >
              <i class="material-icons">check_circle</i>
              Clear All Restrictions
              <span class="tooltip">Clear all strikes and restrictions</span>
            </button>
            <button 
              class="action-btn unlock" 
              @click="handleUserAction(user.id, 'unsuspend')"
              :disabled="isProcessing"
            >
              <i class="material-icons">lock_open</i>
              Remove Restrictions
              <span class="tooltip">Remove restrictions but keep strike count</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="usersUnderReview.length > 0" class="section-title">
      <h2>Users Under Review</h2>
    </div>
    
    <div class="users-review-list">
      <div 
        v-for="user in usersUnderReview" 
        :key="user.id"
        class="user-review-card"
      >
        <div class="user-review-header">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials(user) }}</div>
            <div class="user-details">
              <h3>{{ user.firstName }} {{ user.lastName }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-meta">
                <span class="user-role">{{ user.role }}</span>
                <span class="strike-count">
                  <i class="material-icons">copyright</i> 
                  {{ user.copyrightStrikes }} strikes
                </span>
                <span class="join-date">
                  Joined {{ formatDate(user.createdAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="review-status">
            <span class="status-badge warning">
              <i class="material-icons">warning</i>
              Under Review
            </span>
          </div>
        </div>
        
        <div v-if="user.creatorProfile" class="creator-info">
          <h4>Creator Profile</h4>
          <p><strong>Profession:</strong> {{ user.creatorProfile.profession || 'Not specified' }}</p>
          <p v-if="user.creatorProfile.bio" class="creator-bio">{{ truncateBio(user.creatorProfile.bio) }}</p>
        </div>
        
        <div class="copyright-posts">
          <h4>Recent Posts with Copyright Issues</h4>
          <div v-if="user.posts && user.posts.length > 0" class="post-list">
            <div 
              v-for="post in user.posts" 
              :key="post.id"
              class="post-item"
            >
              <div class="post-header">
                <h5>{{ post.title }}</h5>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <div class="post-copyright" v-if="post.copyrightInfo">
                <div class="copyright-details">
                  <div class="song-info" v-if="getCopyrightInfo(post.copyrightInfo).songInfo">
                    <i class="material-icons">music_note</i>
                    <div>
                      <p class="song-title">{{ getCopyrightInfo(post.copyrightInfo).songInfo.title || 'Unknown title' }}</p>
                      <p class="song-artist">{{ getCopyrightInfo(post.copyrightInfo).songInfo.artist || 'Unknown artist' }}</p>
                    </div>
                  </div>
                </div>
                <a :href="`/admin/posts?id=${post.id}`" class="view-post-btn">
                  <i class="material-icons">visibility</i>
                  View Post
                </a>
              </div>
            </div>
          </div>
          <div v-else class="no-posts">
            <p>No posts with copyright issues found</p>
          </div>
        </div>
        
        <div class="admin-actions">
          <h4>Take Action</h4>
          <div class="action-buttons">
            <button 
              class="action-btn clear" 
              @click="handleUserAction(user.id, 'clear')"
              :disabled="isProcessing"
            >
              <i class="material-icons">check_circle</i>
              Clear Strikes
              <span class="tooltip">Clear all copyright strikes and restore account</span>
            </button>
            <button 
              class="action-btn warn" 
              @click="handleUserAction(user.id, 'warn')"
              :disabled="isProcessing"
            >
              <i class="material-icons">warning</i>
              Issue Warning
              <span class="tooltip">Keep strike count but remove review status</span>
            </button>
            <button 
              class="action-btn suspend" 
              @click="handleUserAction(user.id, 'suspend')"
              :disabled="isProcessing"
            >
              <i class="material-icons">block</i>
              Suspend Account
              <span class="tooltip">Suspend account for copyright violations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="processedUsers.length > 0" class="processed-users">
      <h3>Recently Processed Users</h3>
      <div class="processed-list">
        <div 
          v-for="user in processedUsers" 
          :key="user.id"
          class="processed-item"
          :class="user.action"
        >
          <div class="processed-user-info">
            <div class="user-avatar small">{{ getUserInitials(user) }}</div>
            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
          </div>
          <div class="processed-action">
            <span class="action-type">
              <i class="material-icons">{{ getActionIcon(user.action) }}</i>
              {{ getActionLabel(user.action) }}
            </span>
            <span class="processed-time">{{ formatTime(user.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUsersUnderReview, reviewUserCopyrightStatus, fetchUsersWithRestrictions } from '@/authService';
import Swal from 'sweetalert2';

export default {
  name: 'AdminUserReviewView',
  data() {
    return {
      usersUnderReview: [],
      usersWithRestrictions: [],
      isLoading: true,
      isProcessing: false,
      processedUsers: []
    };
  },
  computed: {
    totalCopyrightStrikes() {
      const reviewStrikes = this.usersUnderReview.reduce((total, user) => total + (user.copyrightStrikes || 0), 0);
      const restrictedStrikes = this.usersWithRestrictions.reduce((total, user) => total + (user.copyrightStrikes || 0), 0);
      return reviewStrikes + restrictedStrikes;
    }
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.isLoading = true;
        
        // Fetch both user types in parallel
        const [underReviewUsers, restrictedUsers] = await Promise.all([
          fetchUsersUnderReview(),
          fetchUsersWithRestrictions()
        ]);
        
        this.usersUnderReview = underReviewUsers;
        this.usersWithRestrictions = restrictedUsers;
        
      } catch (error) {
        console.error('Error fetching users:', error);
        
        Swal.fire({
          title: 'Error',
          text: `Failed to load users: ${error.message}`,
          icon: 'error'
        });
      } finally {
        this.isLoading = false;
      }
    },
    getUserInitials(user) {
      if (!user.firstName && !user.lastName) return '?';
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    },
    truncateBio(bio) {
      return bio.length > 100 ? bio.substring(0, 97) + '...' : bio;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins/60)}h ago`;
      
      return this.formatDate(timestamp);
    },
    getCopyrightInfo(infoString) {
      try {
        if (!infoString) return { isDetected: false };
        return typeof infoString === 'string' ? JSON.parse(infoString) : infoString;
      } catch (error) {
        console.warn('Error parsing copyright info:', error);
        return { isDetected: true, error: 'Invalid copyright data format' };
      }
    },
    getActionIcon(action) {
      switch (action) {
        case 'clear': return 'check_circle';
        case 'warn': return 'warning';
        case 'suspend': return 'block';
        case 'unsuspend': return 'lock_open';
        default: return 'help';
      }
    },
    getActionLabel(action) {
      switch (action) {
        case 'clear': return 'Cleared';
        case 'warn': return 'Warned';
        case 'suspend': return 'Suspended';
        case 'unsuspend': return 'Restrictions Removed';
        default: return 'Unknown';
      }
    },
    async handleUserAction(userId, action) {
      // Get confirmation based on action
      let result;
      let duration;
      
      if (action === 'clear') {
        result = await Swal.fire({
          title: 'Clear Copyright Strikes?',
          text: 'This will remove all copyright strikes and restore the account to good standing. Are you sure?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Clear Strikes',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#42b72a'
        });
      } else if (action === 'warn') {
        // Ask for duration first
        const { value: durationResult } = await Swal.fire({
          title: 'Specify Warning Duration',
          input: 'select',
          inputOptions: {
            '7': '7 days',
            '14': '14 days',
            '30': '30 days',
            '60': '60 days',
            '90': '90 days'
          },
          inputPlaceholder: 'Select warning duration',
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value) {
                resolve();
              } else {
                resolve('You need to select a duration');
              }
            });
          }
        });
        
        if (!durationResult) return; // User cancelled
        duration = parseInt(durationResult); // Parse duration to integer
        
        result = await Swal.fire({
          title: 'Issue Warning?',
          text: `This will keep the strike count and restrict the user from creating new posts for ${duration} days.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Issue Warning',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#F7931A'
        });
      } else if (action === 'suspend') {
        // Ask for duration first
        const { value: durationResult } = await Swal.fire({
          title: 'Specify Suspension Duration',
          input: 'select',
          inputOptions: {
            '7': '7 days',
            '14': '14 days',
            '30': '30 days',
            '60': '60 days',
            '90': '90 days',
            '180': '6 months',
            '365': '1 year'
          },
          inputPlaceholder: 'Select suspension duration',
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value) {
                resolve();
              } else {
                resolve('You need to select a duration');
              }
            });
          }
        });
        
        if (!durationResult) return; // User cancelled
        duration = parseInt(durationResult); // Parse duration to integer
        
        result = await Swal.fire({
          title: 'Suspend Account?',
          html: `This will suspend the user account for <strong>${duration} days</strong>. During this period, the user will not be able to log in and all their posts will be rejected. This action is serious and should be used only when necessary.`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Yes, Suspend Account',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#e41e3f'
        });
      } else if (action === 'unsuspend') {
        result = await Swal.fire({
          title: 'Remove Restrictions?',
          text: 'This will remove all restrictions from the account. The user will regain full access to all features.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Remove Restrictions',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#42b72a'
        });
      }
      
      if (!result.isConfirmed) return;
      
      // Perform the action
      try {
        this.isProcessing = true;
        
        await reviewUserCopyrightStatus(userId, action, duration);
        
        // Store processed user for history
        const user = action === 'unsuspend' 
          ? this.usersWithRestrictions.find(u => u.id === userId)
          : this.usersUnderReview.find(u => u.id === userId);
        
        if (user) {
          this.processedUsers.unshift({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            action,
            duration,
            timestamp: new Date()
          });
          
          // Keep only last 10 processed users
          if (this.processedUsers.length > 10) {
            this.processedUsers = this.processedUsers.slice(0, 10);
          }
        }
        
        // Remove user from the appropriate list
        if (action === 'unsuspend') {
          this.usersWithRestrictions = this.usersWithRestrictions.filter(u => u.id !== userId);
        } else {
          this.usersUnderReview = this.usersUnderReview.filter(u => u.id !== userId);
        }
        
        // Show success message
        let successMessage = '';
        if (action === 'clear') {
          successMessage = 'Copyright strikes cleared successfully.';
        } else if (action === 'warn') {
          successMessage = `Warning issued to user successfully. Restrictions will last for ${duration} days.`;
        } else if (action === 'suspend') {
          successMessage = `Account suspended successfully for ${duration} days.`;
        } else if (action === 'unsuspend') {
          successMessage = 'Account restrictions removed successfully.';
        }
        
        await Swal.fire({
          title: 'Success',
          text: successMessage,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh the lists after action
        this.fetchUsers();
        
      } catch (error) {
        console.error(`Error ${action} user:`, error);
        
        await Swal.fire({
          title: 'Action Failed',
          text: `Failed to ${action} user: ${error.message}`,
          icon: 'error'
        });
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.admin-review-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 28px;
  color: #1c1e21;
  margin-bottom: 10px;
}

.page-title i {
  margin-right: 12px;
  color: #1877f2;
}

.page-description {
  color: #65676B;
  margin-bottom: 24px;
  font-size: 16px;
  border-bottom: 1px solid #e4e6eb;
  padding-bottom: 16px;
}

.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  padding: 20px;
  flex: 1;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #1877f2;
  margin-bottom: 8px;
}

.stat-card:nth-child(2) .stat-value {
  color: #e41e3f;
}

.stat-card:nth-child(3) .stat-value {
  color: #F7931A;
}

.stat-label {
  font-size: 14px;
  color: #65676B;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #65676B;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f2f5;
  border-radius: 50%;
  border-top-color: #1877f2;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 0;
  background-color: #f0f2f5;
  border-radius: 8px;
  color: #65676B;
}

.empty-state i {
  font-size: 64px;
  color: #42b72a;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1c1e21;
}

/* User review card */
.user-review-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 24px;
  overflow: hidden;
}

.user-review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e6eb;
  background-color: #f7f8fa;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background-color: #1877f2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 12px;
}

.user-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.user-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.user-email {
  margin: 0 0 4px 0;
  color: #65676B;
  font-size: 14px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.user-role {
  background-color: #e4e6eb;
  color: #050505;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: capitalize;
}

.strike-count {
  display: flex;
  align-items: center;
  color: #e41e3f;
  font-weight: bold;
}

.strike-count i {
  font-size: 16px;
  margin-right: 4px;
}

.join-date {
  color: #65676B;
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 14px;
}

.status-badge i {
  margin-right: 4px;
  font-size: 18px;
}

.status-badge.warning {
  background-color: #FFF3CD;
  color: #856404;
}

.status-badge.danger {
  background-color: #FFEBEE;
  color: #C62828;
}

.creator-info {
  padding: 16px;
  border-bottom: 1px solid #e4e6eb;
}

.creator-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1c1e21;
}

.creator-info p {
  margin: 4px 0;
  color: #65676B;
}

.creator-bio {
  font-style: italic;
  margin-top: 8px;
  padding-left: 8px;
  border-left: 3px solid #e4e6eb;
}

.copyright-posts {
  padding: 16px;
  border-bottom: 1px solid #e4e6eb;
}

.copyright-posts h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1c1e21;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  background-color: #f7f8fa;
  border-radius: 6px;
  padding: 12px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.post-header h5 {
  margin: 0;
  font-size: 15px;
  color: #1c1e21;
}

.post-date {
  font-size: 12px;
  color: #65676B;
}

.post-copyright {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright-details {
  flex: 1;
}

.song-info {
  display: flex;
  align-items: center;
  background-color: rgba(228, 30, 63, 0.1);
  padding: 8px;
  border-radius: 4px;
}

.song-info i {
  color: #e41e3f;
  margin-right: 8px;
  font-size: 24px;
}

.song-title {
  margin: 0 0 2px 0;
  font-weight: bold;
  font-size: 14px;
}

.song-artist {
  margin: 0;
  font-size: 13px;
  color: #65676B;
}

.view-post-btn {
  display: flex;
  align-items: center;
  background-color: #e4e6eb;
  color: #050505;
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  margin-left: 12px;
  transition: background-color 0.2s;
}

.view-post-btn:hover {
  background-color: #dadde1;
}

.view-post-btn i {
  font-size: 16px;
  margin-right: 4px;
}

.no-posts {
  padding: 12px;
  text-align: center;
  background-color: #f7f8fa;
  border-radius: 6px;
  color: #65676B;
}

.admin-actions {
  padding: 16px;
}

.admin-actions h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1c1e21;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  position: relative;
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 6px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.clear {
  background-color: #e6f7e4;
  color: #42b72a;
}

.action-btn.warn {
  background-color: #fff8e6;
  color: #F7931A;
}

.action-btn.suspend {
  background-color: #ffebee;
  color: #e41e3f;
}

.action-btn.unlock {
  background-color: #e3f2fd;
  color: #1565C0;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn .tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  white-space: nowrap;
  z-index: 100;
}

.action-btn:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Processed users section */
.processed-users {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e4e6eb;
}

.processed-users h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1c1e21;
}

.processed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.processed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f7f8fa;
  border-radius: 8px;
  border-left: 4px solid #e4e6eb;
}

.processed-item.clear {
  border-left-color: #42b72a;
}

.processed-item.warn {
  border-left-color: #F7931A;
}

.processed-item.suspend {
  border-left-color: #e41e3f;
}

.processed-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
}

.processed-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.action-type i {
  font-size: 16px;
}

.processed-time {
  font-size: 12px;
  color: #65676B;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .user-review-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-status {
    margin-top: 12px;
  }
  
  .post-copyright {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .view-post-btn {
    margin-left: 0;
    margin-top: 8px;
  }
}

.section-title {
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e6eb;
}

.section-title h2 {
  font-size: 20px;
  color: #1c1e21;
  margin: 0;
}
</style> 