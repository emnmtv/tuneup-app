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
    
    <!-- Full Screen Image Modal -->
    <div v-if="fullScreenImage" class="fullscreen-image-modal">
      <div class="fullscreen-image-container">
        <img :src="fullScreenImage" alt="Full size image" />
        <button class="close-fullscreen-btn" @click="closeFullScreenImage">
          <i class="material-icons">close</i>
        </button>
      </div>
    </div>

    <!-- Tabs navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button 
          :class="['tab-btn', activeTab === 'restrictions' ? 'active' : '']" 
          @click="activeTab = 'restrictions'"
        >
          <i class="material-icons">block</i>
          User Restrictions
        </button>
        <button 
          :class="['tab-btn', activeTab === 'review' ? 'active' : '']" 
          @click="activeTab = 'review'"
        >
          <i class="material-icons">warning</i>
          Users Under Review
        </button>
        <button 
          :class="['tab-btn', activeTab === 'reports' ? 'active' : '']" 
          @click="activeTab = 'reports'"
        >
          <i class="material-icons">report_problem</i>
          User Reports
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
    
    <!-- Tab content for restrictions -->
    <div v-show="activeTab === 'restrictions'" class="tab-content">
      <div v-if="!isLoading && usersWithRestrictions.length === 0" class="empty-state">
        <i class="material-icons">check_circle</i>
        <h3>No users currently restricted</h3>
        <p>All users are in good standing with no restrictions.</p>
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
              <button 
                class="action-btn view-profile" 
                @click="viewUserProfile(user.id)"
              >
                <i class="material-icons">person</i>
                View Profile
                <span class="tooltip">View detailed user profile</span>
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
    
    <!-- Tab content for users under review -->
    <div v-show="activeTab === 'review'" class="tab-content">
      <div v-if="!isLoading && usersUnderReview.length === 0" class="empty-state">
        <i class="material-icons">check_circle</i>
        <h3>No users currently under review</h3>
        <p>There are no users with pending reviews.</p>
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
              <button 
                class="action-btn view-profile" 
                @click="viewUserProfile(user.id)"
              >
                <i class="material-icons">person</i>
                View Profile
                <span class="tooltip">View detailed user profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab content for reports -->
    <div v-show="activeTab === 'reports'" class="tab-content">
      <div class="section-title">
        <h2>User Reports</h2>
      </div>
      
      <div class="reports-filters">
        <div class="filter-group">
          <label>Filter by Status:</label>
          <div class="filter-options">
            <button 
              v-for="option in reportStatusOptions" 
              :key="option.value"
              :class="['filter-btn', reportFilter === option.value ? 'active' : '']"
              @click="changeReportFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="isLoadingReports" class="loading-container">
        <div class="spinner"></div>
        <p>Loading reports...</p>
      </div>
      
      <div v-else-if="reports.length === 0" class="empty-state">
        <i class="material-icons">check_circle</i>
        <h3>No reports found</h3>
        <p>There are no user reports matching your current filter.</p>
      </div>
      
      <div v-else class="reports-container">
        <div class="reports-list" :class="{ 'details-open': reportDetailsVisible }">
          <div 
            v-for="report in filteredReports" 
            :key="report.id"
            class="report-card"
            :class="{ 'active': selectedReport?.id === report.id }"
            @click="viewReportDetails(report.id)"
          >
            <div class="report-status" :class="report.status">
              <span class="status-indicator"></span>
              {{ report.status }}
            </div>
            
            <div class="report-header">
              <h3 class="report-category">{{ report.category }}</h3>
              <span class="report-date">{{ formatDate(report.createdAt) }}</span>
            </div>
            
            <div class="report-users">
              <div class="reporter">
                <strong>Reported by:</strong> {{ report.reporterUser ? `${report.reporterUser.firstName || ''} ${report.reporterUser.lastName || ''}` : 'Unknown user' }}
              </div>
              <div class="reported">
                <strong>Reported user:</strong> {{ report.reportedUser ? `${report.reportedUser.firstName || ''} ${report.reportedUser.lastName || ''}` : 'Unknown user' }}
              </div>
            </div>
            
            <div class="report-summary">
              <p>{{ report.reason }}</p>
            </div>
            
            <div class="report-actions">
              <button class="view-btn">
                <i class="material-icons">visibility</i>
                View Details
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="reportDetailsVisible" class="report-details-panel">
          <div class="panel-header">
            <h3>Report Details</h3>
            <button class="close-details-btn" @click="closeReportDetails">
              <i class="material-icons">close</i>
            </button>
          </div>
          
          <div v-if="!selectedReport" class="loading-container">
            <div class="spinner"></div>
            <p>Loading report details...</p>
          </div>
          
          <div v-else class="panel-content">
            <div class="report-meta">
              <div class="status-badge" :class="selectedReport.status">
                {{ selectedReport.status }}
              </div>
              <div class="report-id">
                ID: {{ selectedReport.id }}
              </div>
              <div class="report-timestamp">
                Reported on {{ formatDate(selectedReport.createdAt) }}
              </div>
            </div>
            
            <div class="users-involved">
              <div class="user-card reporter">
                <h4>Reported by</h4>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ selectedReport.reporterUser ? getUserInitials(selectedReport.reporterUser) : '?' }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">
                      {{ selectedReport.reporterUser ? `${selectedReport.reporterUser.firstName || ''} ${selectedReport.reporterUser.lastName || ''}` : 'Unknown user' }}
                    </div>
                    <div class="user-email">
                      {{ selectedReport.reporterUser?.email || 'No email available' }}
                    </div>
                    <button v-if="selectedReport.reporterUser?.id" class="view-profile-btn" @click="viewUserProfile(selectedReport.reporterUser.id)">
                      <i class="material-icons">person</i>
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="user-card reported">
                <h4>Reported User</h4>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ selectedReport.reportedUser ? getUserInitials(selectedReport.reportedUser) : '?' }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">
                      {{ selectedReport.reportedUser ? `${selectedReport.reportedUser.firstName || ''} ${selectedReport.reportedUser.lastName || ''}` : 'Unknown user' }}
                    </div>
                    <div class="user-email">
                      {{ selectedReport.reportedUser?.email || 'No email available' }}
                    </div>
                    <button v-if="selectedReport.reportedUser?.id" class="view-profile-btn" @click="viewUserProfile(selectedReport.reportedUser.id)">
                      <i class="material-icons">person</i>
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="report-details">
              <h4>Report Information</h4>
              
              <div class="detail-item">
                <div class="detail-label">Category:</div>
                <div class="detail-value category">{{ selectedReport.category }}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Reason:</div>
                <div class="detail-value">{{ selectedReport.reason }}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Details:</div>
                <div class="detail-value detailed-text">{{ selectedReport.details }}</div>
              </div>
              
              <div v-if="selectedReport.evidenceUrl" class="evidence-section">
                <h5>Evidence</h5>
                <div class="evidence-image">
                  <img :src="selectedReport.evidenceUrl" alt="Report evidence" @click="openFullScreenImage(selectedReport.evidenceUrl)" />
                  <div class="image-overlay">
                    <button @click.stop="openFullScreenImage(selectedReport.evidenceUrl)">
                      <i class="material-icons">open_in_new</i>
                      View Full Size
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- If there's no evidence at all -->
              <div v-else class="evidence-section no-evidence">
                <h5>Evidence</h5>
                <div class="no-evidence-placeholder">
                  <i class="material-icons">image_not_supported</i>
                  <p>No evidence image provided</p>
                </div>
              </div>
              
              <div v-if="selectedReport.adminComments && selectedReport.adminComments.length > 0" class="admin-comments">
                <h5>Admin Comments</h5>
                <div 
                  v-for="(comment, index) in selectedReport.adminComments" 
                  :key="index"
                  class="admin-comment"
                >
                  <div class="comment-header">
                    <span class="admin-name">{{ comment.adminName }}</span>
                    <span class="comment-date">{{ formatDate(comment.timestamp) }}</span>
                  </div>
                  <div class="comment-text">{{ comment.comment }}</div>
                </div>
              </div>
            </div>
            
            <div class="admin-decision" v-if="selectedReport.status !== 'resolved' && selectedReport.status !== 'dismissed'">
              <h4>Take Action</h4>
              
              <div class="action-options">
                <div v-if="selectedReport.status === 'pending'" class="action-option">
                  <button class="action-btn review" @click="handleReportAction(selectedReport.id, 'reviewing')">
                    <i class="material-icons">search</i>
                    Mark as Reviewing
                  </button>
                </div>
                
                <div class="action-option">
                  <button class="action-btn dismiss" @click="handleReportAction(selectedReport.id, 'dismissed')">
                    <i class="material-icons">not_interested</i>
                    Dismiss Report
                  </button>
                </div>
                
                <div class="action-option">
                  <button class="action-btn warn" @click="handleReportAction(selectedReport.id, 'resolved', 'warn')">
                    <i class="material-icons">warning</i>
                    Warn User
                  </button>
                </div>
                
                <div class="action-option">
                  <button class="action-btn suspend" @click="handleReportAction(selectedReport.id, 'resolved', 'suspend')">
                    <i class="material-icons">block</i>
                    Suspend User
                  </button>
                </div>
                
                <div class="action-option">
                  <button class="action-btn delete" @click="handleDeleteReport(selectedReport.id)">
                    <i class="material-icons">delete</i>
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="reports.length > 0" class="pagination">
        <button 
          class="page-btn prev" 
          :disabled="reportsPagination.currentPage === 1"
          @click="changePage(reportsPagination.currentPage - 1)"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        
        <div class="page-info">
          Page {{ reportsPagination.currentPage }} of {{ reportsPagination.totalPages }}
        </div>
        
        <button 
          class="page-btn next" 
          :disabled="reportsPagination.currentPage === reportsPagination.totalPages"
          @click="changePage(reportsPagination.currentPage + 1)"
        >
          <i class="material-icons">chevron_right</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUsersUnderReview, reviewUserCopyrightStatus, fetchUsersWithRestrictions, getReports, getReportDetails, updateReportStatus, deleteReport, MEDIA_BASE_URL } from '@/authService';
import Swal from 'sweetalert2';

export default {
  name: 'AdminUserReviewView',
  data() {
    return {
      usersUnderReview: [],
      usersWithRestrictions: [],
      isLoading: true,
      isProcessing: false,
      processedUsers: [],
      reports: [],
      reportsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalReports: 0
      },
      selectedReport: null,
      isLoadingReports: false,
      reportFilter: 'all',
      reportDetailsVisible: false,
      activeTab: 'restrictions',
      fullScreenImage: null
    };
  },
  computed: {
    totalCopyrightStrikes() {
      const reviewStrikes = this.usersUnderReview.reduce((total, user) => total + (user.copyrightStrikes || 0), 0);
      const restrictedStrikes = this.usersWithRestrictions.reduce((total, user) => total + (user.copyrightStrikes || 0), 0);
      return reviewStrikes + restrictedStrikes;
    },
    filteredReports() {
      return this.reports;
    },
    reportStatusOptions() {
      return [
        { value: 'all', label: 'All Reports' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewing', label: 'Reviewing' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' }
      ];
    }
  },
  async created() {
    await this.fetchUsers();
    await this.fetchReports();
  },
  methods: {
    openFullScreenImage(imageUrl) {
      if (imageUrl) {
        this.fullScreenImage = imageUrl;
      }
    },
    closeFullScreenImage() {
      this.fullScreenImage = null;
    },
    async fetchUsers() {
      try {
        this.isLoading = true;
        
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
      if (!user) return '?';
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
    formatTime(date) {
      if (!date) return '';
      const dateObj = new Date(date);
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    getCopyrightInfo(infoString) {
      try {
        return typeof infoString === 'string' ? JSON.parse(infoString) : infoString;
      } catch (error) {
        console.error('Error parsing copyright info:', error);
        return {};
      }
    },
    getActionIcon(action) {
      const icons = {
        'clear': 'check_circle',
        'warn': 'warning',
        'suspend': 'block',
        'unsuspend': 'lock_open'
      };
      return icons[action] || 'help';
    },
    getActionLabel(action) {
      const labels = {
        'clear': 'Cleared',
        'warn': 'Warned',
        'suspend': 'Suspended',
        'unsuspend': 'Unsuspended'
      };
      return labels[action] || 'Unknown';
    },
    async handleUserAction(userId, action) {
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
        
        if (!durationResult) return;
        duration = parseInt(durationResult);
        
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
        
        if (!durationResult) return;
        duration = parseInt(durationResult);
        
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
      
      try {
        this.isProcessing = true;
        
        await reviewUserCopyrightStatus(userId, action, duration);
        
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
          
          if (this.processedUsers.length > 10) {
            this.processedUsers = this.processedUsers.slice(0, 10);
          }
        }
        
        if (action === 'unsuspend') {
          this.usersWithRestrictions = this.usersWithRestrictions.filter(u => u.id !== userId);
        } else {
          this.usersUnderReview = this.usersUnderReview.filter(u => u.id !== userId);
        }
        
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
    },
    viewUserProfile(userId) {
      if (userId) {
        if (this.isCreator(userId)) {
          this.$router.push(`/creator/${userId}`);
        } else {
          this.$router.push(`/user/${userId}`);
        }
      }
    },
    
    isCreator(userId) {
      const user = [...this.usersUnderReview, ...this.usersWithRestrictions]
        .find(u => u.id === userId);
      return user && user.role === 'creator';
    },
    async fetchReports(page = 1, status = null) {
      try {
        this.isLoadingReports = true;
        const response = await getReports(
          status === 'all' ? null : status, 
          page, 
          10
        );
        
        // Handle different possible response formats
        if (Array.isArray(response)) {
          // If API returns array directly
          this.reports = response;
          this.reportsPagination = {
            currentPage: page,
            totalPages: 1,
            totalReports: response.length
          };
        } else if (response.reports) {
          // If API returns object with reports property
          this.reports = response.reports;
          if (response.pagination) {
            this.reportsPagination = {
              currentPage: response.pagination.page || page,
              totalPages: response.pagination.pages || 1,
              totalReports: response.pagination.total || response.reports.length
            };
          } else {
            // If no pagination info
            this.reportsPagination = {
              currentPage: page,
              totalPages: 1,
              totalReports: response.reports.length
            };
          }
        } else {
          // Fallback for unexpected format
          console.warn('Unexpected API response format:', response);
          this.reports = [];
          this.reportsPagination = {
            currentPage: 1,
            totalPages: 1,
            totalReports: 0
          };
        }
        
        // Ensure each report has at least empty structures for user data
        this.reports = this.reports.map(report => ({
          ...report,
          reporterUser: report.reporterUser || {},
          reportedUser: report.reportedUser || {}
        }));
      } catch (error) {
        console.error('Error fetching reports:', error);
        this.reports = [];
        Swal.fire({
          title: 'Error',
          text: `Failed to load reports: ${error.message}`,
          icon: 'error'
        });
      } finally {
        this.isLoadingReports = false;
      }
    },
    
    async viewReportDetails(reportId) {
      try {
        this.isLoadingReports = true;
        const response = await getReportDetails(reportId);
        
        // Handle different possible response formats
        let report;
        if (response.report) {
          report = response.report;
        } else if (response.id) {
          report = response;
        } else {
          console.warn('Unexpected report details format:', response);
          throw new Error('Invalid report data format');
        }
        
        // Process evidence URL to avoid double uploads
        let evidenceUrl = null;
        if (report.evidenceUrl) {
          evidenceUrl = this.getFullMediaUrl(report.evidenceUrl);
        } else if (report.evidenceImage) {
          evidenceUrl = this.getFullMediaUrl(report.evidenceImage);
        }
        
        // Ensure required properties exist to prevent UI errors
        this.selectedReport = {
          ...report,
          reporterUser: report.reporterUser || {},
          reportedUser: report.reportedUser || {},
          adminComments: report.adminComments || [],
          evidenceUrl: evidenceUrl,
          category: report.category || 'unknown',
          reason: report.reason || 'No reason provided',
          details: report.details || 'No details provided',
          status: report.status || 'pending'
        };
        
        // For debugging
        if (evidenceUrl) {
          console.log('Evidence URL:', evidenceUrl);
        }
        
        this.reportDetailsVisible = true;
      } catch (error) {
        console.error('Error fetching report details:', error);
        Swal.fire({
          title: 'Error',
          text: `Failed to load report details: ${error.message}`,
          icon: 'error'
        });
      } finally {
        this.isLoadingReports = false;
      }
    },
    
    // Add helper method for media URLs
    getFullMediaUrl(path) {
      if (!path) return null;
      
      // If already a full URL, return as is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // Ensure path starts with /
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      
      // Prevent double "uploads" in the path
      if (path.includes('/uploads/uploads/')) {
        path = path.replace('/uploads/uploads/', '/uploads/');
      }
      
      return `${MEDIA_BASE_URL}${path}`;
    },
    
    closeReportDetails() {
      this.reportDetailsVisible = false;
      this.selectedReport = null;
    },
    
    async handleReportAction(reportId, status, action = null) {
      const actionLabels = {
        'reviewing': 'mark as reviewing',
        'resolved': 'resolve',
        'dismissed': 'dismiss',
      };
      
      const { isConfirmed } = await Swal.fire({
        title: `Confirm Action`,
        text: `Are you sure you want to ${actionLabels[status] || 'update'} this report?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Proceed',
        cancelButtonText: 'Cancel'
      });
      
      if (!isConfirmed) return;
      
      let adminComment = '';
      let suspensionDuration = null;
      
      if (status === 'resolved' && action) {
        const commentResult = await Swal.fire({
          title: 'Add Comment',
          input: 'textarea',
          inputPlaceholder: 'Add your comment about this report...',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'Please add a comment explaining your decision';
            }
          }
        });
        
        if (commentResult.isDismissed) return;
        adminComment = commentResult.value;
        
        if (action === 'suspend') {
          const { value: duration } = await Swal.fire({
            title: 'Specify Suspension Duration',
            input: 'select',
            inputOptions: {
              '7': '7 days',
              '14': '14 days',
              '30': '30 days',
              '60': '60 days',
              '90': '90 days'
            },
            showCancelButton: true,
            inputPlaceholder: 'Select duration'
          });
          
          if (!duration) return;
          suspensionDuration = parseInt(duration);
        }
      }
      
      try {
        this.isProcessing = true;
        
        await updateReportStatus(reportId, {
          status,
          adminComment,
          action,
          suspensionDuration
        });
        
        await this.fetchReports(this.reportsPagination.currentPage, this.reportFilter !== 'all' ? this.reportFilter : null);
        
        if (this.selectedReport?.id === reportId) {
          await this.viewReportDetails(reportId);
        }
        
        Swal.fire({
          title: 'Success',
          text: `Report ${actionLabels[status] || 'updated'} successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
      } catch (error) {
        console.error(`Error updating report:`, error);
        Swal.fire({
          title: 'Action Failed',
          text: error.message || 'Failed to update report',
          icon: 'error'
        });
      } finally {
        this.isProcessing = false;
      }
    },
    
    async handleDeleteReport(reportId) {
      const { isConfirmed } = await Swal.fire({
        title: 'Delete Report',
        text: 'Are you sure you want to delete this report? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete Report',
        confirmButtonColor: '#d33',
        cancelButtonText: 'Cancel'
      });
      
      if (!isConfirmed) return;
      
      try {
        this.isProcessing = true;
        
        await deleteReport(reportId);
        
        if (this.selectedReport?.id === reportId) {
          this.closeReportDetails();
        }
        
        await this.fetchReports(this.reportsPagination.currentPage, this.reportFilter !== 'all' ? this.reportFilter : null);
        
        Swal.fire({
          title: 'Deleted',
          text: 'Report has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
      } catch (error) {
        console.error('Error deleting report:', error);
        Swal.fire({
          title: 'Delete Failed',
          text: error.message || 'Failed to delete report',
          icon: 'error'
        });
      } finally {
        this.isProcessing = false;
      }
    },
    
    changeReportFilter(filter) {
      this.reportFilter = filter;
      this.fetchReports(1, filter !== 'all' ? filter : null);
    },
    
    changePage(page) {
      this.fetchReports(page, this.reportFilter !== 'all' ? this.reportFilter : null);
    },
    openImageInNewTab(imageUrl) {
      if (imageUrl) {
        this.openFullScreenImage(imageUrl);
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

/* Full Screen Image Modal */
.fullscreen-image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image-container {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.fullscreen-image-container img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-fullscreen-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-fullscreen-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.close-fullscreen-btn i {
  font-size: 32px;
}

/* Tabs Navigation */
.tabs-container {
  margin-bottom: 24px;
}

.tabs-nav {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 16px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  color: #65676B;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid transparent;
}

.tab-btn i {
  margin-right: 8px;
  font-size: 20px;
}

.tab-btn:hover {
  background-color: #f0f2f5;
  color: #1877f2;
}

.tab-btn.active {
  color: #1877f2;
  border-bottom-color: #1877f2;
  background-color: rgba(24, 119, 242, 0.05);
}

.tab-content {
  margin-top: 20px;
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
  background-color: #dadce1;
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

.action-btn.view-profile {
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
  
  .tabs-nav {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: none;
    border-left: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-bottom-color: transparent;
    border-left-color: #1877f2;
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

/* Reports Section Styles */
.reports-section {
  margin-top: 20px;
}

.reports-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  margin-bottom: 24px;
}

.reports-section h2 i {
  color: #e41e3f;
}

.reports-filters {
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-group label {
  font-weight: 600;
  color: #65676B;
  font-size: 14px;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #e4e6eb;
  border-radius: 20px;
  background: #f0f2f5;
  color: #65676B;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #e4e6eb;
}

.filter-btn.active {
  background: #1877f2;
  color: white;
  border-color: #1877f2;
}

.reports-container {
  display: flex;
  gap: 24px;
}

.reports-list {
  flex: 1;
  transition: width 0.3s;
}

.reports-list.details-open {
  flex: 0 0 35%;
}

.report-details-panel {
  flex: 0 0 62%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 800px;
}

.panel-header {
  padding: 16px 24px;
  background: #f7f8fa;
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1c1e21;
}

.close-details-btn {
  background: none;
  border: none;
  color: #65676B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-details-btn:hover {
  background: rgba(0,0,0,0.05);
}

.panel-content {
  padding: 24px;
  overflow-y: auto;
}

.report-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border-left: 4px solid transparent;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.report-card.active {
  border-left-color: #1877f2;
  background: #f0f7ff;
}

.report-status {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.report-status.pending {
  background: #fff3cd;
  color: #856404;
}

.report-status.reviewing {
  background: #cce5ff;
  color: #004085;
}

.report-status.resolved {
  background: #d4edda;
  color: #155724;
}

.report-status.dismissed {
  background: #f8f9fa;
  color: #6c757d;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.report-status.pending .status-indicator {
  background: #ffc107;
}

.report-status.reviewing .status-indicator {
  background: #007bff;
}

.report-status.resolved .status-indicator {
  background: #28a745;
}

.report-status.dismissed .status-indicator {
  background: #6c757d;
}

.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-right: 80px;
}

.report-category {
  margin: 0;
  font-size: 16px;
  color: #1c1e21;
  text-transform: capitalize;
}

.report-date {
  font-size: 12px;
  color: #65676B;
}

.report-users {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.reporter, .reported {
  font-size: 13px;
  color: #65676B;
}

.report-summary {
  font-size: 14px;
  color: #1c1e21;
  margin-bottom: 16px;
  line-height: 1.4;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  background: #e4e6eb;
  color: #050505;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.view-btn:hover {
  background: #dadce0;
}

.view-btn i {
  font-size: 16px;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.reviewing {
  background: #cce5ff;
  color: #004085;
}

.status-badge.resolved {
  background: #d4edda;
  color: #155724;
}

.status-badge.dismissed {
  background: #f8f9fa;
  color: #6c757d;
}

.report-id, .report-timestamp {
  font-size: 14px;
  color: #65676B;
}

.users-involved {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.user-card {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

.user-card h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #65676B;
}

.user-info {
  display: flex;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1877f2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.user-email {
  font-size: 13px;
  color: #65676B;
  margin-bottom: 8px;
}

.view-profile-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  background: #e4e6eb;
  color: #050505;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.view-profile-btn:hover {
  background: #dadce0;
}

.view-profile-btn i {
  font-size: 16px;
}

.report-details {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.report-details h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1c1e21;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e6eb;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
}

.detail-label {
  width: 100px;
  font-weight: 600;
  color: #65676B;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #1c1e21;
  font-size: 14px;
}

.detail-value.category {
  text-transform: capitalize;
  font-weight: 500;
}

.detail-value.detailed-text {
  white-space: pre-line;
  line-height: 1.5;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 8px;
}

.evidence-section {
  margin-top: 20px;
}

.evidence-section h5 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1c1e21;
}

.evidence-image {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  max-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.evidence-image img {
  max-width: 100%;
  max-height: 300px;
  cursor: pointer;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.evidence-image:hover .image-overlay {
  opacity: 1;
}

.image-overlay button {
  padding: 8px 16px;
  background: white;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.admin-comments {
  margin-top: 20px;
}

.admin-comments h5 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1c1e21;
}

.admin-comment {
  background: #f0f2f5;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.admin-name {
  font-weight: 600;
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  color: #65676B;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
}

.admin-decision {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
}

.admin-decision h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1c1e21;
}

.action-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.action-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-btn i {
  font-size: 24px;
}

.action-btn.review {
  background: #e3f2fd;
  color: #0d47a1;
}

.action-btn.dismiss {
  background: #f5f5f5;
  color: #424242;
}

.action-btn.warn {
  background: #fff8e1;
  color: #ff8f00;
}

.action-btn.suspend {
  background: #ffebee;
  color: #c62828;
}

.action-btn.delete {
  background: #fafafa;
  color: #757575;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 16px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f2f5;
  color: #1c1e21;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e4e6eb;
}

.page-btn:disabled {
  color: #BEC3C9;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #65676B;
}

/* Responsive styles */
@media (max-width: 992px) {
  .users-involved {
    flex-direction: column;
  }
  
  .reports-container {
    flex-direction: column;
  }
  
  .reports-list.details-open {
    flex: 1;
  }
  
  .report-details-panel {
    flex: 1;
  }
  
  .action-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-options {
    grid-template-columns: 1fr;
  }
}

.no-evidence-placeholder {
  padding: 30px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
}

.no-evidence-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-evidence-placeholder p {
  font-size: 14px;
}
</style> 