<template>
  <div class="admin-verification">
    <div class="verification-header">
      <h1>Creator Verification</h1>
      <div class="stats-card">
        <div class="stat-number">{{ pendingRequests.length }}</div>
        <div class="stat-label">Pending Requests</div>
        <div class="stat-icon">
          <i class="material-icons">verified_user</i>
      </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="status-container loading">
      <div class="spinner"></div>
      <p>Loading verification requests...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="status-container error">
      <i class="material-icons">error_outline</i>
      <p>{{ error }}</p>
      <button @click="fetchVerificationRequests" class="btn btn-primary">
        <i class="material-icons">refresh</i>
        Retry
      </button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="pendingRequests.length === 0" class="status-container empty">
      <i class="material-icons">check_circle_outline</i>
      <p>All verification requests have been processed</p>
    </div>
    
    <!-- Requests list -->
    <div v-else class="requests-list">
      <div v-for="request in pendingRequests" :key="request.id" class="request-card">
        <div class="request-card-header">
          <div class="creator-profile">
            <div class="avatar">
              <img v-if="request.user.profilePicture" :src="request.user.profilePicture" alt="Profile">
              <span v-else>{{ getInitials(request.user.firstName, request.user.lastName) }}</span>
            </div>
            <div class="creator-info">
              <h3>{{ request.user.firstName }} {{ request.user.lastName }}</h3>
              <div class="creator-meta">
                <span class="profession">{{ request.profession || 'Creator' }}</span>
                <span class="dot-separator"></span>
                <span class="join-date">Joined {{ formatDate(request.user.createdAt, false) }}</span>
              </div>
            </div>
          </div>
          <div class="request-meta">
            <span class="request-date">
              <i class="material-icons">calendar_today</i>
              Requested {{ formatDate(request.verificationRequestedAt) }}
            </span>
            <span class="post-count">
              <i class="material-icons">article</i>
              {{ request.user?.posts?.length || 0 }} Posts
            </span>
          </div>
        </div>
        
        <div class="request-card-body">
          <div class="reason-section">
            <h4>Reason for Verification</h4>
            <p>{{ request.verificationReason || 'No reason provided' }}</p>
          </div>
          
          <div class="details-grid">
            <div class="details-column">
              <div class="detail-section">
                <h4>About</h4>
                <div class="detail-item" v-if="request.bio">
                  <span class="detail-label">Bio:</span>
                  <span class="detail-value">{{ truncateText(request.bio, 120) }}</span>
              </div>
                <div class="detail-item" v-if="request.offers">
                  <span class="detail-label">Offers:</span>
                  <span class="detail-value">{{ request.offers }}</span>
              </div>
                <div class="detail-item" v-if="request.genre">
                  <span class="detail-label">Genre:</span>
                  <span class="detail-value">{{ request.genre }}</span>
            </div>
          </div>
          
              <div class="detail-section" v-if="hasSocialLinks(request)">
                <h4>Social Media</h4>
            <div class="social-links">
              <a v-if="request.socialMediaLinks?.instagram" :href="formatSocialLink('instagram', request.socialMediaLinks.instagram)" target="_blank" class="social-link instagram">
                <i class="material-icons">photo_camera</i>
              </a>
              <a v-if="request.socialMediaLinks?.twitter" :href="formatSocialLink('twitter', request.socialMediaLinks.twitter)" target="_blank" class="social-link twitter">
                <i class="material-icons">alternate_email</i>
              </a>
              <a v-if="request.socialMediaLinks?.youtube" :href="formatSocialLink('youtube', request.socialMediaLinks.youtube)" target="_blank" class="social-link youtube">
                <i class="material-icons">videocam</i>
              </a>
              <a v-if="request.socialMediaLinks?.website" :href="formatSocialLink('website', request.socialMediaLinks.website)" target="_blank" class="social-link website">
                <i class="material-icons">language</i>
              </a>
                </div>
            </div>
          </div>
          
            <div class="details-column">
              <div class="detail-section">
                <h4>Documents</h4>
                <div class="documents-list">
                  <div v-if="request.validIdDocument" 
                class="document-link"
                       @click="openDocumentModal(request.validIdDocument, 'ID Verification', 'id')">
                <i class="material-icons">badge</i>
                    <span>ID Verification</span>
                  </div>
                  <div v-if="request.portfolioFile" 
                class="document-link"
                       @click="openDocumentModal(`${mediaBaseUrl}/uploads/documents/${request.portfolioFile}`, 'Portfolio', 'portfolio')">
                <i class="material-icons">folder</i>
                    <span>Portfolio</span>
                  </div>
                  <div v-if="request.resumeFile" 
                class="document-link"
                       @click="openDocumentModal(`${mediaBaseUrl}/uploads/documents/${request.resumeFile}`, 'Resume', 'resume')">
                <i class="material-icons">description</i>
                    <span>Resume</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Portfolio/Posts Showcase -->
          <div v-if="request.user?.posts && request.user.posts.length > 0" class="posts-showcase">
            <h4>Content Preview</h4>
            <div class="posts-gallery">
              <div 
                v-for="post in request.user.posts.slice(0, 3)" 
                :key="post.id" 
                class="post-card"
                @click="openPostModal(post)"
              >
                <div class="post-media" 
                     :style="post.image ? { backgroundImage: `url(${mediaBaseUrl}/uploads/${post.image})` } : {}"
                >
                  <div v-if="!post.image" class="no-image">
                    <i class="material-icons">image</i>
                  </div>
                  <div class="post-status" :class="post.status">
                    {{ post.status }}
                  </div>
                  <div class="media-badges">
                    <span v-if="post.audio" class="media-badge audio">
                      <i class="material-icons">audiotrack</i>
                    </span>
                    <span v-if="post.video" class="media-badge video">
                      <i class="material-icons">videocam</i>
                    </span>
                  </div>
                </div>
                <div class="post-info">
                  <h5>{{ truncateText(post.title, 40) }}</h5>
                  <div v-if="post.amount" class="post-price">
                    <i class="material-icons">attach_money</i>
                    {{ formatPrice(post.amount) }}
                  </div>
                  </div>
                  </div>
                </div>
            <div v-if="request.user.posts.length > 3" 
                 @click="openAllPostsModal(request.user, request.user.posts)" 
                 class="view-all-link">
              View all {{ request.user.posts.length }} posts
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>
          
          <div v-else class="no-posts">
            <i class="material-icons">image_not_supported</i>
            <p>No content uploaded yet</p>
          </div>
        </div>
        
        <div class="request-card-footer">
          <button 
            @click="approveRequest(request.id)" 
            class="btn btn-success" 
            :disabled="processingIds.includes(request.id)"
          >
            <i class="material-icons">check_circle</i>
            Approve
          </button>
          <button 
            @click="showRejectDialog(request.id)" 
            class="btn btn-danger" 
            :disabled="processingIds.includes(request.id)"
          >
            <i class="material-icons">cancel</i>
            Reject
          </button>
          <a 
            :href="`/creator/${request.user.id}`" 
            target="_blank" 
            class="btn btn-outline"
          >
            <i class="material-icons">visibility</i>
            View Profile
          </a>
        </div>
      </div>
    </div>
    
    <!-- Redesigned Post Detail Modal -->
    <div class="modal-overlay" v-if="showPostModal" @click.self="closePostModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ selectedPost.title }}</h2>
          <button class="close-btn" @click="closePostModal">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="modal-media">
            <!-- Media display -->
            <div v-if="selectedPost.image" class="media-preview image">
              <img :src="`${mediaBaseUrl}/uploads/${selectedPost.image}`" alt="Post image">
            </div>
            
            <div v-if="selectedPost.video" class="media-preview video">
              <video controls :src="`${mediaBaseUrl}/uploads/${selectedPost.video}`"></video>
              <div class="media-type-badge video">
                <i class="material-icons">videocam</i>
                Video
              </div>
            </div>
            
            <div v-if="selectedPost.audio" class="media-preview audio">
              <div class="audio-player">
                <i class="material-icons audio-icon">audiotrack</i>
                <div class="audio-controls">
                  <audio controls :src="getMediaUrl(selectedPost.audio, 'audio')" preload="metadata"></audio>
                </div>
              </div>
              <div class="media-type-badge audio">
                <i class="material-icons">audiotrack</i>
                Audio
              </div>
            </div>
            
            <div v-if="!selectedPost.image && !selectedPost.video && !selectedPost.audio" class="media-preview empty">
              <i class="material-icons">image_not_supported</i>
              <p>No media available</p>
            </div>
          </div>
          
          <div class="modal-details">
            <div class="detail-column main-details">
              <div class="post-status-badge" :class="selectedPost.status">
                {{ selectedPost.status }}
              </div>
              
              <div class="post-section">
                <h3>Description</h3>
                <p>{{ selectedPost.description }}</p>
              </div>
              
              <div class="post-section" v-if="selectedPost.detailedDescription">
                <h3>Detailed Description</h3>
                <p>{{ selectedPost.detailedDescription }}</p>
              </div>
              
              <div class="post-section" v-if="selectedPost.remarks">
                <h3>Remarks</h3>
                <p>{{ selectedPost.remarks }}</p>
              </div>
            </div>
            
            <div class="detail-column meta-details">
              <div class="post-section price" v-if="selectedPost.amount">
                <h3>Price</h3>
                <div class="price-tag">
                  <i class="material-icons">attach_money</i>
                  <span>{{ formatPrice(selectedPost.amount) }}</span>
                </div>
              </div>
              
              <div class="post-section" v-if="selectedPost.copyrightInfo">
                <h3>Copyright Information</h3>
                <div v-if="isParsableJson(selectedPost.copyrightInfo)" class="copyright-details">
                  <div class="copyright-status-badge" :class="getCopyrightStatus(selectedPost.copyrightInfo)">
                    {{ getCopyrightStatus(selectedPost.copyrightInfo) === 'detected' ? 'Copyright Detected' : 'No Copyright Issues' }}
                  </div>
                  
                  <div v-if="getCopyrightSongName(selectedPost.copyrightInfo)" class="copyright-song">
                    <span class="song-label">Song:</span>
                    <span class="song-title">{{ getCopyrightSongName(selectedPost.copyrightInfo) }}</span>
                  </div>
                  
                  <div v-if="getCopyrightLastChecked(selectedPost.copyrightInfo)" class="last-checked">
                    <i class="material-icons">schedule</i>
                    <span>{{ formatDate(getCopyrightLastChecked(selectedPost.copyrightInfo)) }}</span>
                  </div>
                </div>
                <p v-else>{{ selectedPost.copyrightInfo }}</p>
              </div>
              
              <div class="post-section timestamps">
                <div class="timestamp">
                  <i class="material-icons">event</i>
                  <div class="timestamp-details">
                    <span class="timestamp-label">Created</span>
                    <span class="timestamp-value">{{ formatDate(selectedPost.createdAt) }}</span>
                  </div>
                </div>
                
                <div class="timestamp">
                  <i class="material-icons">update</i>
                  <div class="timestamp-details">
                    <span class="timestamp-label">Last Updated</span>
                    <span class="timestamp-value">{{ formatDate(selectedPost.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add document viewer modal -->
    <div class="modal-overlay" v-if="showDocumentModal" @click.self="closeDocumentModal">
      <div class="modal-container document-modal">
        <div class="modal-header">
          <h2>{{ documentTitle }}</h2>
          <button class="close-btn" @click="closeDocumentModal">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="modal-content document-viewer">
          <!-- PDF Viewer -->
          <iframe 
            v-if="isPdfDocument" 
            :src="documentUrl" 
            class="document-frame"
            frameborder="0"
          ></iframe>
          
          <!-- Image Viewer -->
          <img 
            v-else-if="isImageDocument" 
            :src="documentUrl" 
            class="document-image"
            alt="Document"
          />
          
          <!-- Unknown Document Type -->
          <div v-else class="document-download">
            <i class="material-icons">description</i>
            <p>This document type can't be previewed</p>
            <a :href="documentUrl" target="_blank" class="btn btn-primary">
              <i class="material-icons">file_download</i>
              Download Document
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add "View All Posts" Modal -->
    <div class="modal-overlay" v-if="showAllPostsModal" @click.self="closeAllPostsModal">
      <div class="modal-container all-posts-modal">
        <div class="modal-header">
          <h2>All Posts by {{ selectedCreator?.firstName }} {{ selectedCreator?.lastName }}</h2>
          <button class="close-btn" @click="closeAllPostsModal">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="all-posts-grid">
            <div 
              v-for="post in selectedCreatorPosts" 
              :key="post.id" 
              class="post-card"
              @click="openPostModal(post)"
            >
              <div class="post-media" 
                   :style="post.image ? { backgroundImage: `url(${mediaBaseUrl}/uploads/${post.image})` } : {}"
              >
                <div v-if="!post.image" class="no-image">
                  <i class="material-icons">image</i>
                </div>
                <div class="post-status" :class="post.status">
                  {{ post.status }}
                </div>
                <div class="media-badges">
                  <span v-if="post.audio" class="media-badge audio">
                    <i class="material-icons">audiotrack</i>
                  </span>
                  <span v-if="post.video" class="media-badge video">
                    <i class="material-icons">videocam</i>
                  </span>
                </div>
              </div>
              <div class="post-info">
                <h5>{{ truncateText(post.title, 40) }}</h5>
                <p class="post-desc">{{ truncateText(post.description, 60) }}</p>
                <div v-if="post.amount" class="post-price">
                  <i class="material-icons">attach_money</i>
                  {{ formatPrice(post.amount) }}
                </div>
                <p class="post-date">{{ formatDate(post.createdAt, false) }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="selectedCreatorPosts.length === 0" class="no-posts-found">
            <i class="material-icons">sentiment_dissatisfied</i>
            <p>No posts available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
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
    
    // Modal state
    const showPostModal = ref(false);
    const selectedPost = ref({});
    
    // Document modal state
    const showDocumentModal = ref(false);
    const documentUrl = ref('');
    const documentTitle = ref('');
    const documentType = ref('');
    
    // All posts modal state
    const showAllPostsModal = ref(false);
    const selectedCreator = ref(null);
    const selectedCreatorPosts = ref([]);
    
    const isPdfDocument = computed(() => {
      return documentUrl.value.toLowerCase().endsWith('.pdf');
    });
    
    const isImageDocument = computed(() => {
      const url = documentUrl.value.toLowerCase();
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || 
             url.endsWith('.png') || url.endsWith('.gif');
    });
    
    const openPostModal = (post) => {
      selectedPost.value = post;
      showPostModal.value = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };
    
    const closePostModal = () => {
      showPostModal.value = false;
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
    
    const openDocumentModal = (url, title, type) => {
      documentUrl.value = url;
      documentTitle.value = title;
      documentType.value = type;
      showDocumentModal.value = true;
      document.body.style.overflow = 'hidden';
    };
    
    const closeDocumentModal = () => {
      showDocumentModal.value = false;
      document.body.style.overflow = 'auto';
    };
    
    const openAllPostsModal = (creator, posts) => {
      selectedCreator.value = creator;
      selectedCreatorPosts.value = posts;
      showAllPostsModal.value = true;
      document.body.style.overflow = 'hidden';
    };
    
    const closeAllPostsModal = () => {
      showAllPostsModal.value = false;
      document.body.style.overflow = 'auto';
    };
    
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
      if (!text) return '';
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
      }
      return text;
    };
    
    const formatPrice = (amount) => {
      if (!amount) return 'Free';
      return new Intl.NumberFormat('fil-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };
    
    const getSkillsArray = (skills) => {
      if (!skills) return [];
      return typeof skills === 'string' 
        ? skills.split(',').map(s => s.trim()) 
        : Array.isArray(skills) ? skills : [];
    };
    
    const hasSocialLinks = (request) => {
      if (!request.socialMediaLinks) return false;
      const links = request.socialMediaLinks;
      return !!(links.instagram || links.twitter || links.facebook || 
               links.youtube || links.tiktok || links.soundcloud || links.website);
    };
    
    const formatSocialLink = (platform, link) => {
      if (!link) return '#';
      
      // Add proper prefix if not present
      if (platform === 'instagram' && !link.includes('instagram.com')) {
        return `https://instagram.com/${link.replace('@', '')}`;
      }
      if (platform === 'twitter' && !link.includes('twitter.com') && !link.includes('x.com')) {
        return `https://twitter.com/${link.replace('@', '')}`;
      }
      if (platform === 'facebook' && !link.includes('facebook.com')) {
        return `https://facebook.com/${link}`;
      }
      if (platform === 'youtube' && !link.includes('youtube.com')) {
        return `https://youtube.com/${link}`;
      }
      if (platform === 'tiktok' && !link.includes('tiktok.com')) {
        return `https://tiktok.com/@${link.replace('@', '')}`;
      }
      if (platform === 'soundcloud' && !link.includes('soundcloud.com')) {
        return `https://soundcloud.com/${link}`;
      }
      if (platform === 'website' && !link.includes('http')) {
        return `https://${link}`;
      }
      
      return link;
    };
    
    const isParsableJson = (str) => {
      if (!str) return false;
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    };
    
    const formatCopyrightInfo = (copyrightInfoStr) => {
      if (!copyrightInfoStr) return 'No info';
      
      try {
        const copyrightInfo = JSON.parse(copyrightInfoStr);
        let result = copyrightInfo.isDetected ? 'Copyright Detected' : 'No Copyright Issues';
        
        // Add song name to the preview if available
        const songName = getCopyrightSongName(copyrightInfoStr);
        if (copyrightInfo.isDetected && songName) {
          result += `: ${songName}`;
        }
        
        return result;
      } catch (e) {
        // If not valid JSON, return the first 40 chars
        return truncateText(copyrightInfoStr, 40);
      }
    };
    
    const getCopyrightSongName = (copyrightInfoStr) => {
      try {
        const copyrightInfo = JSON.parse(copyrightInfoStr);
        
        // Check nested structure first (songInfo.title)
        if (copyrightInfo.songInfo && copyrightInfo.songInfo.title) {
          return copyrightInfo.songInfo.title;
        }
        
        // Check nested structure (songInfo.name)
        if (copyrightInfo.songInfo && copyrightInfo.songInfo.name) {
          return copyrightInfo.songInfo.name;
        }
        
        // Check other possible direct fields
        return copyrightInfo.songName || 
               copyrightInfo.trackName || 
               copyrightInfo.song || 
               copyrightInfo.title || 
               null;
      } catch (e) {
        return null;
      }
    };
    
    const getCopyrightStatus = (copyrightInfoStr) => {
      try {
        const copyrightInfo = JSON.parse(copyrightInfoStr);
        return copyrightInfo.isDetected ? 'detected' : 'clean';
      } catch (e) {
        return 'unknown';
      }
    };
    
    const getCopyrightLastChecked = (copyrightInfoStr) => {
      try {
        const copyrightInfo = JSON.parse(copyrightInfoStr);
        return copyrightInfo.lastChecked || null;
      } catch (e) {
        return null;
      }
    };
    
    // Fix audio player
    const getMediaUrl = (path, type = 'default') => {
      // Make sure the path has the correct format
      if (!path) return '';
      
      // If the path already includes the base URL, return it as is
      if (path.includes(mediaBaseUrl)) {
        return path;
      }
      
      // For audio files, use a specific directory
      if (type === 'audio') {
        return `${mediaBaseUrl}/uploads/audio/${path}`;
      }
      
      // Otherwise, use the default uploads directory
      return `${mediaBaseUrl}/uploads/${path}`;
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
      truncateText,
      formatPrice,
      getSkillsArray,
      hasSocialLinks,
      formatSocialLink,
      showPostModal,
      selectedPost,
      openPostModal,
      closePostModal,
      isParsableJson,
      formatCopyrightInfo,
      getCopyrightStatus,
      getCopyrightLastChecked,
      getCopyrightSongName,
      showDocumentModal,
      documentUrl,
      documentTitle,
      documentType,
      isPdfDocument,
      isImageDocument,
      openDocumentModal,
      closeDocumentModal,
      showAllPostsModal,
      selectedCreator,
      selectedCreatorPosts,
      openAllPostsModal,
      closeAllPostsModal,
      getMediaUrl
    };
  }
};
</script>

<style scoped>
/* Base styles */
.admin-verification {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  color: #2c3e50;
  font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header styles */
.verification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.verification-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
}

.stats-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-right: 1rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
  margin-right: 1.5rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
}

.stat-icon i {
  font-size: 1.75rem;
}

/* Status containers */
.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  margin-bottom: 2rem;
}

.status-container i {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
}

.status-container p {
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.status-container.loading i,
.status-container.loading .spinner {
  color: #4361ee;
}

.status-container.error i {
  color: #e63946;
}

.status-container.empty i {
  color: #2a9d8f;
}

.spinner {
  border: 4px solid rgba(67, 97, 238, 0.1);
  border-top: 4px solid #4361ee;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover {
  background-color: #3a0ca3;
  transform: translateY(-1px);
}

/* Add responsive styles */
@media (max-width: 768px) {
  .admin-verification {
    padding: 1rem;
  }
  
  .verification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-card {
    width: 100%;
    padding: 1rem;
  }
}

.requests-list {
  display: grid;
  gap: 2rem;
}

.request-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.request-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.request-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  background-color: #f8f9fa;
}

.creator-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #6c757d;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.creator-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.creator-meta {
  display: flex;
  align-items: center;
  color: #6c757d;
  font-size: 0.95rem;
}

.dot-separator {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #adb5bd;
  margin: 0 8px;
}

.request-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.request-date, .post-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.request-card-body {
  padding: 1.5rem;
}

.reason-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
}

.reason-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  color: #212529;
}

.reason-section p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #212529;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-item {
  margin-bottom: 0.75rem;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;
}

.detail-value {
  color: #6c757d;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  transition: transform 0.2s;
}

.social-link:hover {
  transform: scale(1.1);
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}

.social-link.twitter {
  background: #1da1f2;
}

.social-link.youtube {
  background: #ff0000;
}

.social-link.website {
  background: #6c757d;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-link {
  cursor: pointer;
}

.posts-showcase {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f3f5;
}

.posts-showcase h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #212529;
}

.posts-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.post-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  background: white;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-media {
  height: 0;
  padding-bottom: 75%;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: #f8f9fa;
}

.no-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
}

.no-image i {
  font-size: 2rem;
}

.post-status {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.post-status.approved {
  background-color: rgba(40, 167, 69, 0.9);
  color: white;
}

.post-status.pending {
  background-color: rgba(255, 193, 7, 0.9);
  color: #212529;
}

.post-status.rejected {
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
}

.media-badges {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.media-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
}

.media-badge.audio {
  background-color: rgba(0, 123, 255, 0.9);
}

.media-badge.video {
  background-color: rgba(111, 66, 193, 0.9);
}

.post-info {
  padding: 1rem;
}

.post-info h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
}

.post-price {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #28a745;
  font-weight: 600;
}

.view-all-link {
  cursor: pointer;
}

.no-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #adb5bd;
}

.no-posts i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.request-card-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn {
  flex: 1;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #dee2e6;
  color: #495057;
}

.btn-outline:hover {
  background-color: #f8f9fa;
  color: #212529;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .request-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .request-meta {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .posts-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .request-card-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .posts-gallery {
    grid-template-columns: 1fr;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #212529;
  transform: rotate(90deg);
}

.modal-content {
  overflow-y: auto;
  max-height: calc(90vh - 70px);
}

.modal-media {
  position: relative;
}

.media-preview {
  width: 100%;
  position: relative;
}

.media-preview.image img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  background-color: #f8f9fa;
}

.media-preview.video video {
  width: 100%;
  max-height: 500px;
  background-color: black;
}

.media-preview.audio {
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.audio-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.audio-icon {
  font-size: 3rem;
  color: #4361ee;
  margin-bottom: 1rem;
}

.audio-controls {
  width: 100%;
}

.audio-controls audio {
  width: 100%;
  height: 50px;
}

.media-preview.empty {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.media-preview.empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.media-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  color: white;
  font-weight: 600;
}

.media-type-badge.video {
  background-color: rgba(111, 66, 193, 0.9);
}

.media-type-badge.audio {
  background-color: rgba(0, 123, 255, 0.9);
}

.modal-details {
  display: flex;
  padding: 2rem;
  gap: 2rem;
}

.detail-column {
  flex: 1;
}

.detail-column.main-details {
  flex: 2;
}

.post-status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  color: white;
  font-weight: 600;
  text-transform: capitalize;
}

.post-status-badge.approved {
  background-color: #28a745;
}

.post-status-badge.pending {
  background-color: #ffc107;
  color: #212529;
}

.post-status-badge.rejected {
  background-color: #dc3545;
}

.post-section {
  margin-bottom: 2rem;
}

.post-section h3 {
  font-size: 1.1rem;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  color: #212529;
}

.post-section p {
  margin: 0;
  line-height: 1.6;
  color: #495057;
}

.price-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #28a745;
}

.copyright-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.copyright-status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
}

.copyright-status-badge.detected {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.copyright-status-badge.clean {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.copyright-status-badge.unknown {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.copyright-song {
  margin-top: 0.5rem;
}

.song-label {
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;
}

.song-title {
  color: #dc3545;
  font-style: italic;
}

.last-checked {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.timestamps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timestamp i {
  color: #6c757d;
  font-size: 1.25rem;
}

.timestamp-details {
  display: flex;
  flex-direction: column;
}

.timestamp-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.timestamp-value {
  color: #212529;
}

@media (max-width: 992px) {
  .modal-details {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-details {
    padding: 1rem;
  }
}

/* Document modal styles */
.document-modal {
  max-width: 90%;
  height: 90vh;
}

.document-viewer {
  height: calc(90vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.document-frame {
    width: 100%;
  height: 100%;
  border: none;
}

.document-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.document-download {
  display: flex;
    flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  }
  
.document-download i {
  font-size: 4rem;
  color: #6c757d;
    margin-bottom: 1rem;
  }
  
.document-download p {
  margin-bottom: 1.5rem;
  color: #6c757d;
}

/* Improve audio player controls */
.audio-controls audio {
    width: 100%;
  height: 50px;
}

audio::-webkit-media-controls-panel {
  background-color: #f8f9fa;
}

audio::-webkit-media-controls-play-button {
  background-color: #4361ee;
  border-radius: 50%;
}

/* All posts modal styles */
.all-posts-modal {
  max-width: 1200px;
  width: 90%;
}

.all-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.post-desc {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.post-date {
  font-size: 0.75rem;
  color: #adb5bd;
  margin-top: 0.5rem;
}

.no-posts-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #adb5bd;
}

.no-posts-found i {
  font-size: 4rem;
  margin-bottom: 1rem;
}
</style>
