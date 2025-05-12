<template>
  <div class="topnav">
    <div class="nav-left">
      <router-link :to="isLoggedIn ? '/dashboard' : '/'" class="brand">
        <img src="@/assets/logo.png" alt="TuneUp" class="brand-logo" />
      </router-link>
      
      <div class="search-container">
        <i class="material-icons search-icon">search</i>
        <input 
          type="text" 
          placeholder="Search TuneUp" 
          class="search-input"
          v-model="searchQuery"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        />
      </div>
    </div>

    <div class="nav-center" v-if="userRole && navigationItems[userRole]">
      <router-link
        v-for="item in navigationItems[userRole]"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: $route.path === item.path }"
      >
        <i class="material-icons">{{ item.icon }}</i>
        <span class="tooltip">{{ item.name }}</span>
      </router-link>
    </div>

    <div class="nav-right">
      <button class="mobile-menu-toggle" @click="toggleNav">
        <i class="material-icons">menu</i>
      </button>
      
      <div class="action-buttons">
        <button class="icon-button" @click="toggleNotifications">
          <i class="material-icons">notifications</i>
          <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
          <span class="tooltip">Notifications</span>
        </button>
        <button class="icon-button" @click="goToMessages()">
          <i class="material-icons">message</i>
          <span class="tooltip">Messages</span>
        </button>
        <div class="profile-menu">
          <button class="profile-button" @click="toggleProfileMenu">
            <div class="avatar">{{ userInitials }}</div>
          </button>
          <div class="dropdown-menu" v-if="showProfileMenu" :class="{ 'menu-active': showProfileMenu }">
            <div class="menu-header">
              <div class="avatar">{{ userInitials }}</div>
              <div class="user-info">
                <div class="user-name">{{ userName || 'TuneUp User' }}</div>
                <div class="user-role">{{ userRole || 'User' }}</div>
              </div>
            </div>
            <router-link to="/profile" class="menu-item" @click="showProfileMenu = false">
              <i class="material-icons">person</i>
              Profile
            </router-link>
            <router-link to="/settings" class="menu-item" @click="showProfileMenu = false">
              <i class="material-icons">settings</i>
              Settings
            </router-link>
            <div class="menu-divider"></div>
            <button @click="logout" class="menu-item logout">
              <i class="material-icons">logout</i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="notifications-panel" v-if="showNotifications" :class="{ 'panel-active': showNotifications }">
    <div class="panel-header">
      <h3>Notifications</h3>
      <div class="panel-actions">
        <button v-if="totalNotifications > 0" class="mark-read-button" @click="handleMarkAllAsRead">
          Mark all as read
        </button>
        <button class="close-button" @click="showNotifications = false">
          <i class="material-icons">close</i>
        </button>
      </div>
    </div>
    
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
        <span v-if="messageNotifications.length > 0" class="tab-badge">{{ messageNotifications.length }}</span>
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'system' }" 
        @click="activeTab = 'system'"
      >
        System
        <span v-if="systemNotifications.length > 0" class="tab-badge">{{ systemNotifications.length }}</span>
      </button>
    </div>
    
    <div v-if="isLoadingNotifications" class="notification-loading">
      <div class="spinner"></div>
      <p>Loading notifications...</p>
    </div>
    
    <div v-else class="notification-list">
      <!-- All notifications tab -->
      <template v-if="activeTab === 'all'">
        <!-- System notifications -->
        <div 
          class="notification-item" 
          :class="{ unread: !notification.read }" 
          v-for="notification in systemNotifications" 
          :key="`system-${notification.id}`"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-avatar" :class="getNotificationColor(notification.type)">
            <i class="material-icons">{{ getNotificationIcon(notification.type) }}</i>
          </div>
          <div class="notification-content">
            <p class="notification-text">{{ notification.title }}</p>
            <p class="notification-preview" v-html="truncateHTML(notification.message)"></p>
            <p class="notification-time">{{ formatTime(notification.createdAt) }}</p>
          </div>
        </div>

        <!-- Message notifications -->
        <div 
          class="notification-item" 
          :class="{ unread: true }" 
          v-for="(notification, index) in messageNotifications" 
          :key="`message-${index}`" 
          @click="goToMessages(notification.senderId)"
        >
          <div class="notification-avatar blue">
            <i class="material-icons">message</i>
          </div>
          <div class="notification-content">
            <p class="notification-text"><strong>{{ notification.senderName }}</strong> sent you a message</p>
            <p class="notification-preview">{{ truncateMessage(notification.content) }}</p>
            <p class="notification-time">{{ formatTime(notification.time) }}</p>
          </div>
        </div>
        
        <!-- Show empty state if no notifications -->
        <div class="empty-notifications" v-if="totalNotifications === 0">
          <i class="material-icons">notifications_none</i>
          <p>No new notifications</p>
        </div>
      </template>
      
      <!-- Messages tab -->
      <template v-else-if="activeTab === 'messages'">
        <div 
          class="notification-item unread" 
          v-for="(notification, index) in messageNotifications" 
          :key="`message-tab-${index}`" 
          @click="goToMessages(notification.senderId)"
        >
          <div class="notification-avatar blue">
            <i class="material-icons">message</i>
          </div>
          <div class="notification-content">
            <p class="notification-text"><strong>{{ notification.senderName }}</strong> sent you a message</p>
            <p class="notification-preview">{{ truncateMessage(notification.content) }}</p>
            <p class="notification-time">{{ formatTime(notification.time) }}</p>
          </div>
        </div>
        
        <div class="empty-notifications" v-if="messageNotifications.length === 0">
          <i class="material-icons">forum</i>
          <p>No new messages</p>
        </div>
      </template>
      
      <!-- System tab -->
      <template v-else-if="activeTab === 'system'">
        <div 
          class="notification-item" 
          :class="{ unread: !notification.read }" 
          v-for="notification in systemNotifications" 
          :key="`system-tab-${notification.id}`"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-avatar" :class="getNotificationColor(notification.type)">
            <i class="material-icons">{{ getNotificationIcon(notification.type) }}</i>
          </div>
          <div class="notification-content">
            <p class="notification-text">{{ notification.title }}</p>
            <p class="notification-preview" v-html="truncateHTML(notification.message)"></p>
            <p class="notification-time">{{ formatTime(notification.createdAt) }}</p>
          </div>
        </div>
        
        <div class="empty-notifications" v-if="systemNotifications.length === 0">
          <i class="material-icons">system_update</i>
          <p>No system notifications</p>
        </div>
      </template>
    </div>
    
    <div class="panel-footer">
      <button class="see-all-button" @click="goToMessages()" v-if="activeTab === 'messages' || activeTab === 'all'">
        See all messages
      </button>
      <router-link to="/notifications" class="see-all-button" v-if="activeTab === 'system' || activeTab === 'all'" @click="showNotifications = false">
        See all notifications
      </router-link>
    </div>
  </div>

  <transition name="slide">
    <div v-if="isCollapsed" class="mobile-menu">
      <div class="mobile-search">
        <i class="material-icons search-icon">search</i>
        <input 
          type="text" 
          placeholder="Search TuneUp" 
          class="search-input"
        />
      </div>
      <router-link
        v-for="item in navigationItems[userRole]"
        :key="item.path"
        :to="item.path"
        class="mobile-link"
        @click="isCollapsed = false"
      >
        <i class="material-icons">{{ item.icon }}</i>
        {{ item.name }}
      </router-link>
    </div>
  </transition>
  
  <!-- Overlay for mobile menu -->
  <transition name="fade">
    <div v-if="isCollapsed" class="mobile-overlay" @click="isCollapsed = false"></div>
  </transition>
</template>

<script>
import { logoutUser, fetchUsersWithChatHistory, fetchUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../authService';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/dist/sweetalert2.min.css';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      isCollapsed: false,
      userRole: null,
      userName: null,
      navigationItems: {
        admin: [
          { name: 'Dashboard', path: '/admin-dashboard', icon: 'dashboard' },
          { name: 'Manage Users', path: '/admin/users', icon: 'people' },
          { name: 'Users Under Review', path: '/admin/reviews', icon: 'gavel' },
          { name: 'Verifications', path: '/admin/verifications', icon: 'verified_user' },
          { name: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
          { name: 'Profile', path: '/profile', icon: 'person' },
        ],
        creator: [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Profile', path: '/profile', icon: 'person' },
          { name: 'Creator Profile', path: '/creatorprofile', icon: 'badge' },
          { name: 'Create Post', path: '/createpost', icon: 'add_circle' },
          { name: 'Creator Posts', path: '/creatorpost', icon: 'list' },
          { name: 'Client Orders', path: '/user-payments', icon: 'payment' },
          { name: 'Creator Dashboard', path: '/creator-dashboard', icon: 'dashboard' },
        ],
        user: [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Upgrade to Creator', path: '/upgrade', icon: 'arrow_upward' },
          { name: 'Profile', path: '/profile', icon: 'person' },
          { name: 'Orders', path: '/client-payments', icon: 'payment' },
        ],
      },
      showProfileMenu: false,
      showNotifications: false,
      userInitials: 'TU',
      notificationCount: 0,
      searchQuery: '',
      isSearchFocused: false,
      messageNotifications: [],
      systemNotifications: [],
      isLoadingNotifications: false,
      totalNotifications: 0,
      activeTab: 'all',
      currentUserId: null,
    };
  },
  async created() {
    this.userRole = localStorage.getItem('userRole');
    this.userName = localStorage.getItem('userName') || 'TuneUp User';
    this.currentUserId = parseInt(localStorage.getItem('userId')) || null;
    
    // Calculate user initials from name if available
    if (this.userName && this.userName !== 'TuneUp User') {
      this.userInitials = this.userName
        .split(' ')
        .map(name => name[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    
    // Close profile menu when clicking outside
    document.addEventListener('click', this.handleClickOutside);
    
    // Set default active tab
    this.activeTab = 'all';
    
    // Fetch notifications
    await this.fetchAllNotifications();
    
    // Set up polling for new notifications every 2 minutes
    this.notificationInterval = setInterval(() => {
      this.fetchAllNotifications();
    }, 120000);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    clearInterval(this.notificationInterval);
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    toggleNav() {
      this.isCollapsed = !this.isCollapsed;
      // Close other menus when opening mobile menu
      if (this.isCollapsed) {
        this.showProfileMenu = false;
        this.showNotifications = false;
      }
    },
    toggleProfileMenu(event) {
      event.stopPropagation();
      this.showProfileMenu = !this.showProfileMenu;
      // Close notifications panel when opening profile menu
      if (this.showProfileMenu) {
        this.showNotifications = false;
      }
    },
    toggleNotifications(event) {
      event.stopPropagation();
      this.showNotifications = !this.showNotifications;
      // Close profile menu when opening notifications
      if (this.showNotifications) {
        this.showProfileMenu = false;
        // Fetch latest notifications when panel is opened
        this.fetchAllNotifications();
      }
    },
    handleClickOutside(event) {
      const profileMenu = document.querySelector('.profile-menu');
      const notificationsButton = document.querySelector('.icon-button');
      const notificationsPanel = document.querySelector('.notifications-panel');
      
      if (profileMenu && !profileMenu.contains(event.target) && this.showProfileMenu) {
        this.showProfileMenu = false;
      }
      
      if (notificationsPanel && !notificationsPanel.contains(event.target) && 
          notificationsButton && !notificationsButton.contains(event.target) && 
          this.showNotifications) {
        this.showNotifications = false;
      }
    },
    async logout() {
      try {
        const success = logoutUser();
        if (success) {
          // Emit logout event to parent
          this.$emit('logout');
          
          await Swal.fire({
            title: 'Logged Out',
            text: 'You have been successfully logged out',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          
          // Clear any stored data
          this.userRole = null;
          this.isCollapsed = false;
          
          // Redirect to landing page
          this.router.push('/');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Failed to logout. Please try again.',
          icon: 'error'
        });
      }
    },
    async fetchMessageNotifications() {
      try {
        // Fetch chat history which includes users and their last messages
        const chatHistory = await fetchUsersWithChatHistory();
        
        // Transform chat history into notifications
        this.messageNotifications = chatHistory
          .filter(chat => chat.lastMessage && !chat.lastMessage.read && chat.lastMessage.senderId !== this.currentUserId)
          .map(chat => ({
            senderId: chat.user.id,
            senderName: `${chat.user.firstName} ${chat.user.lastName}`,
            content: chat.lastMessage.content,
            time: new Date(chat.lastMessage.createdAt),
            read: false
          }))
          .sort((a, b) => b.time - a.time); // Sort by most recent
          
        this.updateNotificationCount();
      } catch (error) {
        console.error('Error fetching message notifications:', error);
      }
    },
    async fetchSystemNotifications() {
      try {
        this.isLoadingNotifications = true;
        const result = await fetchUserNotifications(20, 0, false);
        this.systemNotifications = result.notifications;
        this.updateNotificationCount();
      } catch (error) {
        console.error('Error fetching system notifications:', error);
      } finally {
        this.isLoadingNotifications = false;
      }
    },
    async fetchAllNotifications() {
      await Promise.all([
        this.fetchMessageNotifications(),
        this.fetchSystemNotifications()
      ]);
    },
    updateNotificationCount() {
      this.totalNotifications = this.messageNotifications.length + 
        this.systemNotifications.filter(n => !n.read).length;
      this.notificationCount = this.totalNotifications;
    },
    truncateMessage(message) {
      // Check if it's a payment message
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'payment') {
          return `Payment request: ₱${parsed.amount}`;
        }
      } catch (e) {
        // Not a JSON message, continue with normal truncation
      }
      
      return message.length > 30 ? message.substring(0, 27) + '...' : message;
    },
    truncateHTML(html) {
      // Strip HTML tags for preview
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent || div.innerText || '';
      return text.length > 50 ? text.substring(0, 47) + '...' : text;
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
      
      return date.toLocaleDateString();
    },
    goToMessages(userId) {
      // Close notifications panel
      this.showNotifications = false;
      
      // Navigate to messages page, with optional userId parameter
      if (userId) {
        this.router.push({ path: '/messages', query: { userId } });
      } else {
        this.router.push('/messages');
      }
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
    async handleNotificationClick(notification) {
      // Mark notification as read
      try {
        await markNotificationAsRead(notification.id);
        // Update the notification status in local state without removing it
        const index = this.systemNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.systemNotifications[index].read = true;
          this.updateNotificationCount();
        }
        
        // Handle different notification types
        if (notification.type === 'copyright_strike') {
          this.showNotifications = false;
          this.router.push('/creatorpost');
        } else if (notification.type === 'account_review') {
          this.showNotifications = false;
          this.router.push('/profile');
        } else if (notification.type === 'admin_alert') {
          this.showNotifications = false;
          if (this.userRole === 'admin') {
            this.router.push('/admin/reviews');
          }
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    },
    async handleMarkAllAsRead() {
      try {
        await markAllNotificationsAsRead();
        // Update all notifications to read in local state
        this.systemNotifications = this.systemNotifications.map(n => ({ ...n, read: true }));
        this.updateNotificationCount();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  },
};
</script>

<style scoped>
/* Base Styles */
.topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 56px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

/* Left Section */
.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.brand-logo {
  height: 40px;
  width: auto;
  transition: transform 0.3s ease;
}

.brand:hover .brand-logo {
  transform: scale(1.05);
}

.search-container {
  position: relative;
  max-width: 240px;
  transition: max-width 0.3s ease;
}

.search-container:focus-within {
  max-width: 300px;
}

.search-input {
  padding: 8px 8px 8px 36px;
  border-radius: 20px;
  border: none;
  background: #f0f2f5;
  width: 100%;
  font-size: 14px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  background-color: #e4e6eb;
  box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #606770;
  font-size: 20px;
}

/* Center Section */
.nav-center {
  display: flex;
  justify-content: center;
  flex: 2;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: #65676B;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  height: 56px;
  position: relative;
}

.nav-link i {
  font-size: 24px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.nav-link:hover i {
  transform: translateY(-2px);
  color: #1877f2;
}

.nav-link:hover {
  background-color: #f0f2f5;
}

.nav-link.active {
  color: #1877f2;
}

.nav-link.active i {
  color: #1877f2;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #1877f2;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 1002;
}

.nav-link:hover .tooltip,
.icon-button:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Right Section */
.nav-right {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
  gap: 8px;
}

.mobile-menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.mobile-menu-toggle:hover {
  background-color: #e4e6eb;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.icon-button:hover {
  background: #e4e6eb;
  transform: translateY(-2px);
}

.icon-button:active {
  transform: translateY(0);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e41e3f;
  color: white;
  border-radius: 50%;
  padding: 3px 6px;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Profile Menu */
.profile-menu {
  position: relative;
}

.profile-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.profile-button:hover {
  transform: translateY(-2px);
}

.avatar {
  width: 40px;
  height: 40px;
  background: #1877f2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.profile-button:hover .avatar {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  width: 300px;
  padding: 8px 0;
  margin-top: 8px;
  z-index: 1001;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.menu-active {
  opacity: 1;
  transform: translateY(0);
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #dadde1;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  font-size: 16px;
}

.user-role {
  color: #65676B;
  font-size: 14px;
  text-transform: capitalize;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #050505;
  text-decoration: none;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f0f2f5;
}

.menu-item i {
  color: #1877f2;
}

.menu-divider {
  height: 1px;
  background: #dadde1;
  margin: 8px 0;
}

.logout {
  color: #e41e3f;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
}

.logout i {
  color: #e41e3f;
}

/* Notifications Panel */
.notifications-panel {
  position: fixed;
  top: 56px;
  right: 16px;
  width: 360px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1001;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.panel-active {
  opacity: 1;
  transform: translateY(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dadde1;
}

.panel-header h3 {
  margin: 0;
  font-size: 20px;
  color: #050505;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #65676B;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #f0f2f5;
}

.notification-list {
  overflow-y: auto;
  max-height: 60vh;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background-color: #f0f2f5;
}

.notification-item.unread {
  background-color: #e7f3ff;
}

.notification-item.unread:hover {
  background-color: #daeafd;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.notification-avatar.blue {
  background-color: #1877f2;
}

.notification-avatar.green {
  background-color: #42b72a;
}

.notification-avatar.purple {
  background-color: #8a3ab9;
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #050505;
}

.notification-time {
  margin: 0;
  font-size: 12px;
  color: #65676B;
}

.panel-footer {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #dadde1;
  gap: 8px;
}

.see-all-button {
  flex: 1;
  background: none;
  border: none;
  color: #1877f2;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.see-all-button:hover {
  background-color: #f0f2f5;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  background-color: white;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 56px;
  left: 0;
  width: 80%;
  max-width: 320px;
  height: calc(100vh - 56px);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

.mobile-search {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #dadde1;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: #050505;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-bottom: 1px solid #f0f2f5;
}

.mobile-link i {
  color: #1877f2;
}

.mobile-link:hover {
  background-color: #f0f0f0;
  transform: translateX(5px);
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: calc(100vh - 56px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Media Queries */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-link {
    padding: 8px 12px;
  }
}

@media (max-width: 768px) {
  .nav-center {
    display: none;
  }
  
  .search-container {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .nav-left {
    flex: 0;
  }
  
  .nav-right {
    flex: 1;
  }
  
  .notifications-panel {
    width: 100%;
    right: 0;
    border-radius: 0;
  }
}

/* Updated notification styles */
.notification-preview {
  margin: 4px 0;
  font-size: 13px;
  color: #65676B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #65676B;
}

.empty-notifications i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #dadde1;
}

/* Panel Header Updates */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dadde1;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark-read-button {
  background: none;
  border: none;
  color: #1877f2;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.mark-read-button:hover {
  background-color: rgba(24, 119, 242, 0.1);
}

/* Notification Tabs */
.notification-tabs {
  display: flex;
  border-bottom: 1px solid #dadde1;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #65676B;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab-button.active {
  color: #1877f2;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #1877f2;
  animation: slideIn 0.3s ease;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e41e3f;
  color: white;
  border-radius: 10px;
  height: 18px;
  min-width: 18px;
  padding: 0 6px;
  font-size: 12px;
  margin-left: 6px;
  font-weight: bold;
}

/* Loading animation */
.notification-loading {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #65676B;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #f0f2f5;
  border-radius: 50%;
  border-top-color: #1877f2;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Notification item updates */
.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background-color: #f0f2f5;
}

.notification-item.unread {
  background-color: #e7f3ff;
}

.notification-item.unread:hover {
  background-color: #daeafd;
}

/* Notification Avatar Color Extensions */
.notification-avatar.red {
  background-color: #e41e3f;
}

.notification-avatar.orange {
  background-color: #F7931A;
}

.notification-avatar.green {
  background-color: #42b72a;
}

.notification-avatar.purple {
  background-color: #8a3ab9;
}

.notification-avatar.blue {
  background-color: #1877f2;
}

/* Empty notification styling updates */
.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #65676B;
}

.empty-notifications i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #dadde1;
}

/* Updated Panel Footer */
.panel-footer {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #dadde1;
  gap: 8px;
}

.see-all-button {
  flex: 1;
  background: none;
  border: none;
  color: #1877f2;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.see-all-button:hover {
  background-color: #f0f2f5;
}
</style>
