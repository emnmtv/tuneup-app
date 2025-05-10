<template>
  <div class="notifications-container">
    <h1 class="page-title">
      <i class="material-icons">notifications</i>
      Notifications
    </h1>
    
    <div class="notification-tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'all' }" 
        @click="activeTab = 'all'"
      >
        All
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'messages' }" 
        @click="activeTab = 'messages'"
      >
        Messages
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'system' }" 
        @click="activeTab = 'system'"
      >
        System
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'copyright' }" 
        @click="activeTab = 'copyright'"
      >
        Copyright Notices
      </button>
    </div>
    
    <div class="notification-filters">
      <div class="filter-group">
        <label class="filter-label">Show:</label>
        <select v-model="readFilter" class="filter-select">
          <option value="all">All Notifications</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>
      
      <button v-if="hasUnreadNotifications" class="action-btn" @click="handleMarkAllAsRead">
        <i class="material-icons">done_all</i>
        Mark All as Read
      </button>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading notifications...</p>
    </div>
    
    <div v-else-if="displayedNotifications.length === 0" class="empty-state">
      <i class="material-icons">notifications_off</i>
      <h3>No notifications to display</h3>
      <p>You don't have any {{ activeTab === 'all' ? '' : activeTab + ' ' }}notifications{{ readFilter !== 'all' ? ' that are ' + readFilter : '' }}.</p>
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in displayedNotifications" 
        :key="notification.id"
        class="notification-card"
        :class="{ unread: !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-header">
          <div class="notification-avatar" :class="getNotificationColor(notification.type)">
            <i class="material-icons">{{ getNotificationIcon(notification.type) }}</i>
          </div>
          <div class="notification-meta">
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            <span v-if="!notification.read" class="unread-badge">New</span>
          </div>
        </div>
        
        <div class="notification-content">
          <h3 class="notification-title">{{ notification.title }}</h3>
          <div class="notification-message" v-html="notification.message"></div>
          
          <!-- Copyright details section -->
          <div v-if="notification.type === 'copyright_strike' && notification.metadata" class="copyright-details">
            <div class="song-info">
              <i class="material-icons">music_note</i>
              <div>
                <p v-if="getCopyrightInfo(notification.metadata).songInfo" class="song-title">
                  {{ getCopyrightInfo(notification.metadata).songInfo.title || 'Unknown title' }}
                </p>
                <p v-if="getCopyrightInfo(notification.metadata).songInfo" class="song-artist">
                  {{ getCopyrightInfo(notification.metadata).songInfo.artist || 'Unknown artist' }}
                </p>
              </div>
            </div>
            <div v-if="notification.metadata.postId" class="notification-actions">
              <button class="view-btn" @click.stop="viewPost(notification.metadata.postId)">
                <i class="material-icons">visibility</i>
                View Post
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="hasMoreNotifications" class="load-more">
        <button class="load-more-btn" @click="loadMoreNotifications" :disabled="isLoadingMore">
          <span v-if="isLoadingMore">
            <div class="spinner small"></div>
            Loading...
          </span>
          <span v-else>Load More</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/authService';
import { useRouter } from 'vue-router';

export default {
  name: 'NotificationsView',
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      notifications: [],
      messageNotifications: [],
      isLoading: true,
      isLoadingMore: false,
      activeTab: 'all',
      readFilter: 'all',
      currentPage: 0,
      hasMoreNotifications: false,
      pageSize: 20
    };
  },
  computed: {
    displayedNotifications() {
      let filtered = this.notifications;
      
      // Filter by tab
      if (this.activeTab === 'system') {
        filtered = filtered.filter(n => n.type !== 'copyright_strike' && n.type !== 'message');
      } else if (this.activeTab === 'copyright') {
        filtered = filtered.filter(n => n.type === 'copyright_strike');
      } else if (this.activeTab === 'messages') {
        // Use separate message notifications
        return this.messageNotifications;
      }
      
      // Filter by read status
      if (this.readFilter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else if (this.readFilter === 'read') {
        filtered = filtered.filter(n => n.read);
      }
      
      return filtered;
    },
    hasUnreadNotifications() {
      return this.notifications.some(n => !n.read);
    }
  },
  async created() {
    await this.fetchNotifications();
  },
  methods: {
    async fetchNotifications(loadMore = false) {
      try {
        if (loadMore) {
          this.isLoadingMore = true;
          this.currentPage++;
        } else {
          this.isLoading = true;
          this.currentPage = 0;
        }
        
        const offset = this.currentPage * this.pageSize;
        const result = await fetchUserNotifications(this.pageSize, offset, true); // Include read notifications
        
        if (loadMore) {
          this.notifications = [...this.notifications, ...result.notifications];
        } else {
          this.notifications = result.notifications;
        }
        
        // Set whether there are more notifications to load
        this.hasMoreNotifications = result.notifications.length >= this.pageSize;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    },
    async loadMoreNotifications() {
      await this.fetchNotifications(true);
    },
    getNotificationIcon(type) {
      switch (type) {
        case 'copyright_strike':
          return 'copyright';
        case 'account_review':
          return 'account_circle';
        case 'admin_alert':
          return 'admin_panel_settings';
        case 'payment':
          return 'payment';
        case 'system':
          return 'announcement';
        default:
          return 'notifications';
      }
    },
    getNotificationColor(type) {
      switch (type) {
        case 'copyright_strike':
          return 'red';
        case 'account_review':
          return 'orange';
        case 'admin_alert':
          return 'purple';
        case 'payment':
          return 'green';
        case 'system':
          return 'blue';
        default:
          return 'blue';
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },
    getCopyrightInfo(metadataString) {
      try {
        if (!metadataString) return { isDetected: false };
        return typeof metadataString === 'string' ? JSON.parse(metadataString) : metadataString;
      } catch (error) {
        console.warn('Error parsing copyright info:', error);
        return { isDetected: true, error: 'Invalid copyright data format' };
      }
    },
    async handleNotificationClick(notification) {
      if (!notification.read) {
        try {
          await markNotificationAsRead(notification.id);
          // Update notification status locally
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.notifications[index].read = true;
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
      
      // Handle different notification types
      if (notification.type === 'copyright_strike' && notification.metadata && notification.metadata.postId) {
        this.viewPost(notification.metadata.postId);
      } else if (notification.type === 'account_review') {
        this.router.push('/profile');
      } else if (notification.type === 'admin_alert' && this.$route.path !== '/admin/reviews') {
        if (localStorage.getItem('userRole') === 'admin') {
          this.router.push('/admin/reviews');
        }
      }
    },
    viewPost(postId) {
      this.router.push(`/post/${postId}`);
    },
    async handleMarkAllAsRead() {
      try {
        await markAllNotificationsAsRead();
        // Update all notifications to read in local state
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 28px;
  color: #1c1e21;
  margin-bottom: 24px;
}

.page-title i {
  margin-right: 12px;
  color: #1877f2;
}

.notification-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e6eb;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.notification-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #65676B;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tab-button.active {
  color: #1877f2;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #1877f2;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.notification-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 8px;
  font-size: 14px;
  color: #65676B;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e4e6eb;
  background-color: white;
  font-size: 14px;
  color: #1c1e21;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #f0f2f5;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #1c1e21;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #e4e6eb;
}

.action-btn i {
  font-size: 18px;
}

/* Loading */
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

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-right: 8px;
  margin-bottom: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 0;
  background-color: #f7f8fa;
  border-radius: 8px;
  color: #65676B;
  margin-top: 20px;
}

.empty-state i {
  font-size: 64px;
  color: #65676B;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1c1e21;
}

/* Notification cards */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid transparent;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.notification-card.unread {
  border-left-color: #1877f2;
  background-color: #f0f7ff;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.notification-avatar.red {
  background-color: #e41e3f;
}

.notification-avatar.orange {
  background-color: #F7931A;
}

.notification-avatar.purple {
  background-color: #8e44ad;
}

.notification-avatar.green {
  background-color: #42b72a;
}

.notification-avatar.blue {
  background-color: #1877f2;
}

.notification-avatar i {
  font-size: 20px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-time {
  color: #65676B;
  font-size: 13px;
}

.unread-badge {
  background-color: #1877f2;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.notification-content {
  padding-left: 8px;
}

.notification-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1c1e21;
}

.notification-message {
  color: #505050;
  font-size: 14px;
  line-height: 1.4;
}

/* Copyright details */
.copyright-details {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(228, 30, 63, 0.05);
  border-radius: 6px;
}

.song-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.song-info i {
  color: #e41e3f;
  margin-right: 8px;
  font-size: 20px;
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

.notification-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #f0f2f5;
  border: none;
  color: #1c1e21;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background-color: #e4e6eb;
}

.view-btn i {
  font-size: 16px;
}

/* Load more button */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 8px 16px;
  background-color: #f0f2f5;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #1c1e21;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-more-btn:hover:not(:disabled) {
  background-color: #e4e6eb;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .notification-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style> 