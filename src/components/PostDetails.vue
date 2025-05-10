<template>
  <div v-if="post" class="post-details-container">
    <!-- Back Navigation -->
    <div class="back-nav">
      <button @click="handleBack" class="back-button">
        <i class="material-icons">arrow_back</i>
        Back
      </button>
    </div>

    <!-- Engagement Stats Badge -->
    <div class="engagement-stats" v-if="showEngagementStats">
      <div class="stats-badge views">
        <i class="material-icons">visibility</i>
        <span>{{ post.viewCount || 0 }} views</span>
      </div>
      <div class="stats-badge plays" v-if="post.audio">
        <i class="material-icons">audiotrack</i>
        <span>{{ post.audioPlayCount || 0 }} plays</span>
      </div>
      <div class="stats-badge clicks">
        <i class="material-icons">touch_app</i>
        <span>{{ post.clickThroughCount || 0 }} interactions</span>
      </div>
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
          
          <!-- Main Audio -->
          <div v-if="currentMedia.type === 'audio'" class="main-media audio-container">
            <div class="audio-player-container">
              <!-- Show copyright notice instead of audio player if copyrighted -->
              <div v-if="post.copyrightInfo && post.copyrightInfo.isDetected" class="copyright-warning-wrapper">
                <div class="copyright-alert">
                  <i class="material-icons">copyright</i>
                  <h3>Copyrighted Content</h3>
                  <p>This audio contains copyrighted material and cannot be played.</p>
                  <p class="song-details">
                    <strong>{{ post.copyrightInfo.songInfo?.title || 'Unknown Title' }}</strong> by 
                    <strong>{{ post.copyrightInfo.songInfo?.artist || 'Unknown Artist' }}</strong>
                  </p>
                  <p class="copyright-notice">
                    Please respect intellectual property rights. You may contact the creator for more information.
                  </p>
                </div>
              </div>
              
              <!-- Show audio player only if not copyrighted -->
              <div v-else class="modern-audio-player">
                <div class="player-album-art">
                  <img :src="post.image || 'https://via.placeholder.com/150?text=Audio'" alt="Album art">
                  <div class="player-overlay" @click="toggleAudio">
                    <i class="material-icons">{{ isAudioPlaying ? 'pause_circle_filled' : 'play_circle_filled' }}</i>
                  </div>
                </div>
                
                <div class="player-content">
                  <div class="player-track-info">
                    <div class="track-title">{{ post.title }}</div>
                    <div class="track-artist">{{ post.user.firstName }} {{ post.user.lastName }}</div>
                  </div>
                  
                  <div class="player-controls">
                    <audio 
                      ref="audioElement"
                      :src="currentMedia.url" 
                      class="hidden-audio"
                      controlsList="nodownload"
                      @play="handleAudioPlay"
                      @pause="handleAudioPause"
                      @timeupdate="updateProgress"
                      @loadedmetadata="setDuration"
                    ></audio>
                    
                    <div class="player-progress">
                      <div class="waveform-container">
                        <div class="waveform-visualization">
                          <div v-for="i in 40" :key="i" class="waveform-bar" 
                               :style="{height: `${5 + Math.random() * 20}px`, opacity: (i/40) < audioProgress ? 1 : 0.3}"></div>
                        </div>
                        <div class="progress-bg" @click="seekAudio"></div>
                        <div class="progress-fill" :style="{width: `${audioProgress * 100}%`}"></div>
                      </div>
                      
                      <div class="time-display">
                        <span class="current-time">{{ formatTime(currentTime) }}</span>
                        <span class="duration-time">{{ formatTime(duration) }}</span>
                      </div>
                    </div>
                    
                    <div class="control-buttons">
                      <button class="control-btn" @click="rewindAudio">
                        <i class="material-icons">replay_10</i>
                      </button>
                      
                      <button class="control-btn play-btn" @click="toggleAudio">
                        <i class="material-icons">{{ isAudioPlaying ? 'pause' : 'play_arrow' }}</i>
                      </button>
                      
                      <button class="control-btn" @click="forwardAudio">
                        <i class="material-icons">forward_10</i>
                      </button>
                      
                      <div class="volume-control">
                        <button class="control-btn" @click="toggleMute">
                          <i class="material-icons">{{ isMuted ? 'volume_off' : 'volume_up' }}</i>
                        </button>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          v-model="volume" 
                          @input="changeVolume"
                          class="volume-slider"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Copyright Information - shown below player if not copyrighted -->
              <div v-if="post.copyrightInfo && post.copyrightInfo.isDetected" class="copyright-info">
                <div class="copyright-header">
                  <i class="material-icons copyright-icon">copyright</i>
                  <span>Copyright Information</span>
                </div>
                <div class="song-details">
                  <p class="song-title">{{ post.copyrightInfo.songInfo?.title || 'Unknown Title' }}</p>
                  <p class="song-artist">by {{ post.copyrightInfo.songInfo?.artist || 'Unknown Artist' }}</p>
                  <p v-if="post.copyrightInfo.songInfo?.album" class="song-album">
                    Album: {{ post.copyrightInfo.songInfo.album }}
                  </p>
                  <p v-if="post.copyrightInfo.songInfo?.releaseDate" class="song-date">
                    Released: {{ post.copyrightInfo.songInfo.releaseDate }}
                  </p>
                </div>
                <div class="music-services" v-if="post.copyrightInfo.services">
                  <p class="services-label">Available on:</p>
                  <div class="service-links">
                    <a v-if="post.copyrightInfo.services?.spotify" 
                      :href="post.copyrightInfo.services.spotify.url" 
                      target="_blank" 
                      class="service-link spotify">
                      Spotify
                    </a>
                    <a v-if="post.copyrightInfo.services?.appleMusic" 
                      :href="post.copyrightInfo.services.appleMusic.url" 
                      target="_blank" 
                      class="service-link apple">
                      Apple Music
                    </a>
                    <a v-if="post.copyrightInfo.services?.deezer" 
                      :href="post.copyrightInfo.services.deezer.url" 
                      target="_blank" 
                      class="service-link deezer">
                      Deezer
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
          
          <!-- Audio Thumbnail -->
          <div 
            v-if="post.audio" 
            :class="['media-thumbnail audio-thumbnail', { active: currentMedia.url === post.audio }]"
            @click="setCurrentMedia('audio', post.audio)"
          >
            <div class="audio-indicator">
              <i class="material-icons">audiotrack</i>
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
            <div class="creator-avatar" @click="openCreatorModal">
              {{ getInitials(post.user.firstName, post.user.lastName) }}
            </div>
            <div class="creator-info">
              <h2 @click="openCreatorModal" class="clickable-name">{{ post.user.firstName }} {{ post.user.lastName }}</h2>
              <span class="creator-role">{{ post.user.role }}</span>
              <div class="verification-badge" v-if="post.user.creatorProfile?.isVerified">
                <i class="material-icons">verified</i>
                Verified Creator
              </div>
              <div class="creator-level" v-if="post.user.creatorProfile?.creatorLevel !== undefined">
                <div class="stars">
                  <i v-for="n in 5" :key="n" class="material-icons stars-icon" 
                     :class="{ 'filled': n <= Math.round(post.user.creatorProfile.creatorLevel) }">
                    star
                  </i>
                </div>
                <span class="level-text">{{ post.user.creatorProfile.creatorLevel.toFixed(1) }}/5.0</span>
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
            <button @click="openCreatorModal" class="profile-btn">
              <i class="material-icons">person</i>
              View Profile
            </button>
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

    <!-- Creator Profile Modal -->
    <div v-if="isCreatorModalOpen" class="modal-overlay" @click="closeCreatorModal">
      <div class="creator-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Creator Profile</h2>
          <button class="close-btn" @click="closeCreatorModal">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="creator-modal-body">
          <!-- Creator Profile Header -->
          <div class="creator-profile-header">
            <div class="creator-cover-photo" :style="coverPhotoStyle"></div>
            <div class="creator-profile-main">
              <div class="creator-avatar-large">
                <img v-if="post.user.profilePicture" :src="post.user.profilePicture" :alt="post.user.firstName" />
                <div v-else class="initials-avatar">
                  {{ getInitials(post.user.firstName, post.user.lastName) }}
                </div>
              </div>
              <div class="creator-main-info">
                <h2>{{ post.user.firstName }} {{ post.user.lastName }}</h2>
                <div class="creator-badges">
                  <div v-if="post.user.creatorProfile?.isVerified" class="creator-badge verified">
                    <i class="material-icons">verified</i>
                    <span>Verified Creator</span>
                  </div>
                  <div class="creator-badge level">
                    <div class="stars">
                      <i v-for="n in 5" :key="n" class="material-icons stars-icon" 
                         :class="{ 'filled': n <= Math.round(post.user.creatorProfile?.creatorLevel || 0) }">
                        star
                      </i>
                    </div>
                    <span>{{ (post.user.creatorProfile?.creatorLevel || 0).toFixed(1) }}/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Creator Bio -->
          <div class="creator-section" v-if="post.user.creatorProfile?.bio">
            <h3>About</h3>
            <p>{{ post.user.creatorProfile.bio }}</p>
          </div>

          <!-- Professional Details -->
          <div class="creator-section">
            <h3>Professional Details</h3>
            <div class="creator-details-grid">
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
            </div>
          </div>

          <!-- Services Offered -->
          <div class="creator-section" v-if="post.user.creatorProfile?.offers">
            <h3>Services Offered</h3>
            <div class="offers-tags">
              <span v-for="offer in getOffers(post.user.creatorProfile.offers)" 
                    :key="offer" 
                    class="offer-tag">
                {{ offer }}
              </span>
            </div>
          </div>

          <!-- Portfolio & Documents -->
          <div class="creator-section">
            <h3>Portfolio & Documents</h3>
            <div class="document-links">
              <a v-if="post.user.creatorProfile?.portfolioFile" :href="post.user.creatorProfile.portfolioFile" 
                 target="_blank" class="document-link">
                <i class="material-icons">description</i>
                <span>Portfolio</span>
              </a>
              <a v-if="post.user.creatorProfile?.resumeFile" :href="post.user.creatorProfile.resumeFile" 
                 target="_blank" class="document-link">
                <i class="material-icons">article</i>
                <span>Resume</span>
              </a>
              <a v-if="post.user.creatorProfile?.portfolio" :href="post.user.creatorProfile.portfolio" 
                 target="_blank" class="document-link">
                <i class="material-icons">link</i>
                <span>Portfolio Website</span>
              </a>
            </div>
          </div>

          <!-- Social Media Links -->
          <div class="creator-section" v-if="post.user.creatorProfile?.socialLinks && post.user.creatorProfile.socialLinks.length > 0">
            <h3>Social Media</h3>
            <div class="social-links">
              <a v-for="link in post.user.creatorProfile.socialLinks" 
                 :key="link.id" 
                 :href="link.url" 
                 target="_blank" 
                 class="social-link">
                <i class="material-icons">{{ getSocialIcon(link.platform) }}</i>
                <span>{{ link.platform }}</span>
              </a>
            </div>
          </div>
          
          <!-- Creator Ratings Section -->
          <div class="creator-section" v-if="creatorRatings">
            <h3>Ratings & Reviews</h3>
            <div class="rating-stats">
              <div class="average-rating">
                <div class="rating-value">{{ creatorRatings.stats.average.toFixed(1) }}</div>
                <div class="stars">
                  <span v-for="star in 5" :key="star" class="material-icons"
                    :class="{ filled: star <= Math.round(creatorRatings.stats.average) }">
                    star
                  </span>
                </div>
                <div class="total-ratings">{{ creatorRatings.stats.total }} ratings</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeCreatorModal">Close</button>
          <button class="profile-btn view-full-profile" @click="viewCreatorProfile">
            <i class="material-icons">person</i>
            View Full Profile
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
import { ref } from 'vue';
import { 
  fetchPostDetails, 
  sendMessage, 
  fetchCreatorRatingsById,
  trackPostView,
  trackAudioPlay,
  trackClickThrough
} from '../authService.js';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      post: null,
      error: null,
      isModalOpen: false,
      isCreatorModalOpen: false,
      messageContent: '',
      showMediaPreview: ref(false),
      previewType: ref(null),
      currentMedia: {
        type: null,
        url: null
      },
      creatorRatings: null,
      audioStartTime: null,
      isAudioPlaying: false,
      audioProgress: 0,
      currentTime: 0,
      duration: 0,
      isMuted: false,
      volume: 0.5,
      showEngagementStats: false
    };
  },
  computed: {
    hasMultipleMedia() {
      return (this.post?.image && this.post?.video) || 
             (this.post?.image && this.post?.audio) ||
             (this.post?.video && this.post?.audio) ||
             (Array.isArray(this.post?.images) && this.post?.images.length > 0);
    },
    coverPhotoStyle() {
      return this.post?.user.coverPhoto 
        ? { backgroundImage: `url(${this.post.user.coverPhoto})` } 
        : { backgroundColor: '#e0e0e0' };
    }
  },
  async created() {
    try {
      const postId = this.$route.params.postId;
      this.post = await fetchPostDetails(postId);
      
      // Get user role to check if we should show engagement stats
      const userRole = localStorage.getItem('userRole');
      this.showEngagementStats = userRole === 'admin' || 
                                (userRole === 'creator' && 
                                 this.post.userId === parseInt(localStorage.getItem('userId')));
      
      // Track post view when details are loaded
      trackPostView(postId);
      
      // Set initial media
      if (this.post.audio) {
        this.setCurrentMedia('audio', this.post.audio);
      } else if (this.post.video) {
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
    getSocialIcon(platform) {
      const platformLower = platform.toLowerCase();
      if (platformLower.includes('facebook')) return 'facebook';
      if (platformLower.includes('twitter') || platformLower.includes('x')) return 'twitter';
      if (platformLower.includes('instagram')) return 'photo_camera';
      if (platformLower.includes('linkedin')) return 'work';
      if (platformLower.includes('youtube')) return 'smart_display';
      if (platformLower.includes('tiktok')) return 'music_video';
      if (platformLower.includes('spotify')) return 'headphones';
      if (platformLower.includes('soundcloud')) return 'audiotrack';
      return 'link';
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
      
      // Track click-through for messaging
      if (this.post && this.post.id) {
        trackClickThrough('post', this.post.id, 'message');
      }
      
      this.isModalOpen = true;
    },
    openCreatorModal() {
      this.isCreatorModalOpen = true;
      
      // Track click-through for viewing creator details
      if (this.post && this.post.id) {
        trackClickThrough('post', this.post.id, 'creator_details');
      }
    },
    closeMessageModal() {
      this.isModalOpen = false;
      this.messageContent = '';
    },
    closeCreatorModal() {
      this.isCreatorModalOpen = false;
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
    handleBack() {
      // Track click-through for back navigation
      if (this.post && this.post.id) {
        trackClickThrough('post', this.post.id, 'navigation', 'back');
      }
      
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
      // Track media switch if changing from a different media type
      if (this.currentMedia.type && this.currentMedia.type !== type && this.post) {
        trackClickThrough('post', this.post.id, 'media_switch', type);
      }
      
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
    },
    viewCreatorProfile() {
      if (this.post && this.post.user && this.post.user.id) {
        // Close modal if open
        if (this.isCreatorModalOpen) {
          this.closeCreatorModal();
        }
        
        // Track click-through from post to creator profile
        trackClickThrough('post', this.post.id, 'profile', this.post.user.id);
        
        this.$router.push(`/creator/${this.post.user.id}`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not find creator profile',
        });
      }
    },
    // Audio tracking methods with improved analytics
    handleAudioPlay() {
      this.audioStartTime = Date.now();
      this.isAudioPlaying = true;
      
      // Track initial play event immediately
      if (this.post) {
        trackAudioPlay(this.post.id, 0); // 0 duration means just started
      }
    },
    
    handleAudioPause() {
      this.isAudioPlaying = false;
      if (this.audioStartTime && this.post) {
        // Calculate duration in seconds
        const durationInSeconds = Math.floor((Date.now() - this.audioStartTime) / 1000);
        
        // Only track if played for at least 2 seconds to avoid accidental plays
        if (durationInSeconds >= 2) {
          trackAudioPlay(this.post.id, durationInSeconds);
        }
        
        this.audioStartTime = null;
      }
    },
    toggleAudio() {
      if (!this.$refs.audioElement) return;
      
      if (this.isAudioPlaying) {
        this.$refs.audioElement.pause();
      } else {
        this.$refs.audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
          // Show fallback message if autoplay is prevented
          Swal.fire({
            icon: 'info',
            title: 'Playback Error',
            text: 'Please use the controls to play the audio manually.'
          });
        });
      }
    },
    updateProgress(event) {
      this.audioProgress = event.target.currentTime / event.target.duration;
      this.currentTime = event.target.currentTime;
    },
    setDuration(event) {
      this.duration = event.target.duration;
    },
    rewindAudio() {
      if (!this.$refs.audioElement) return;
      this.$refs.audioElement.currentTime = Math.max(0, this.$refs.audioElement.currentTime - 10);
    },
    forwardAudio() {
      if (!this.$refs.audioElement) return;
      this.$refs.audioElement.currentTime = Math.min(this.$refs.audioElement.duration, this.$refs.audioElement.currentTime + 10);
    },
    toggleMute() {
      if (!this.$refs.audioElement) return;
      this.$refs.audioElement.muted = !this.isMuted;
      this.isMuted = !this.isMuted;
    },
    changeVolume() {
      if (!this.$refs.audioElement) return;
      this.$refs.audioElement.volume = this.volume;
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    // Add seekAudio function
    seekAudio(event) {
      if (!this.$refs.audioElement) return;
      
      const waveformContainer = event.currentTarget;
      const rect = waveformContainer.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const clickPositionRatio = offsetX / rect.width;
      
      // Set the currentTime based on the click position
      this.$refs.audioElement.currentTime = this.$refs.audioElement.duration * clickPositionRatio;
      
      // Update progress visually
      this.audioProgress = clickPositionRatio;
      this.currentTime = this.$refs.audioElement.currentTime;
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

.creator-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stars {
  display: flex;
}

.stars-icon {
  font-size: 1.2rem;
  color: #ccc;
  margin-right: -2px;
}

.stars-icon.filled {
  color: #ffc107;
}

.level-text {
  font-size: 0.9rem;
  color: #666;
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

.profile-btn,
.message-btn {
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

.profile-btn {
  background: #673ab7; /* Purple for profile */
  color: white;
}

.message-btn {
  background: #2196f3; /* Blue for message */
  color: white;
}

.profile-btn:hover {
  background: #5e35b1;
}

.message-btn:hover {
  background: #1976d2;
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

/* Audio Player Styles */
.audio-container {
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a, #303030);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  color: white;
  margin-bottom: 1.5rem;
}

.audio-player-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modern-audio-player {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.player-album-art {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.player-album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.player-album-art:hover .player-overlay {
  opacity: 1;
}

.player-overlay i {
  font-size: 48px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.player-track-info {
  text-align: center;
}

.track-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: white;
}

.track-artist {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.player-progress {
  position: relative;
  width: 100%;
}

.waveform-container {
  position: relative;
  width: 100%;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.waveform-visualization {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 1px;
}

.waveform-bar {
  position: relative;
  width: calc(100% / 50);
  background: linear-gradient(to top, #1ed760, #1db954);
  border-radius: 1px;
  margin: 0 1px;
  transition: height 0.2s ease;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 40px;
  background: rgba(30, 215, 96, 0.2);
  pointer-events: none;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0 0.5rem;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.control-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, color 0.2s;
  opacity: 0.85;
  padding: 0.5rem;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.play-btn {
  background: #1ed760;
  color: #121212;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 12px rgba(30, 215, 96, 0.3);
}

.play-btn:hover {
  background: #1db954;
}

.play-btn i {
  font-size: 28px;
}

.control-btn i {
  font-size: 22px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.volume-slider {
  width: 80px;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
}

.hidden-audio {
  display: none;
}

.copyright-info {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.copyright-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #d32f2f;
  font-weight: bold;
}

.copyright-icon {
  color: #d32f2f;
}

.song-details {
  margin-bottom: 1.5rem;
}

.song-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
}

.song-artist {
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem;
}

.song-album, .song-date {
  font-size: 0.9rem;
  color: #888;
  margin: 0.25rem 0;
}

.music-services {
  margin-top: 1rem;
}

.services-label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.service-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.service-link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.2s;
}

.service-link:hover {
  transform: translateY(-2px);
}

.spotify {
  background: #1DB954;
  color: white;
}

.apple {
  background: #FB233B;
  color: white;
}

.deezer {
  background: #00C7F2;
  color: white;
}

.audio-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.audio-indicator {
  color: #2196f3;
  border-radius: 50%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
}

.audio-indicator i {
  font-size: 24px;
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

/* Copyright warning styles */
.copyright-warning-wrapper {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  margin-bottom: 1rem;
}

.copyright-alert {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.copyright-alert i {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.copyright-alert h3 {
  color: #dc3545;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.copyright-alert p {
  margin: 0.5rem 0;
}

.copyright-alert .song-details {
  font-size: 1.1rem;
  margin: 1rem 0;
}

.copyright-alert .copyright-notice {
  font-style: italic;
  color: #6c757d;
  margin-top: 1rem;
}

/* Add new styles for engagement stats */
.engagement-stats {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stats-badge.views {
  background-color: #e3f2fd;
  color: #2196f3;
}

.stats-badge.plays {
  background-color: #e8f5e9;
  color: #4caf50;
}

.stats-badge.clicks {
  background-color: #fff3e0;
  color: #ff9800;
}

.clickable-name {
  cursor: pointer;
  transition: color 0.2s;
}

.clickable-name:hover {
  color: #2196f3;
}

.creator-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.creator-avatar:hover {
  transform: scale(1.05);
}

/* Improved creator modal styles */
.creator-modal-content {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  scrollbar-width: thin;
}

.creator-modal-body {
  padding: 0;
}

.creator-profile-header {
  position: relative;
  margin-bottom: 100px;
}

.creator-cover-photo {
  height: 220px;
  background-size: cover;
  background-position: center;
  background-color: #444;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.creator-profile-main {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.creator-avatar-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(45deg, #5e35b1, #3f51b5);
  border: 5px solid white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.creator-avatar-large:hover {
  transform: scale(1.05);
}

.creator-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(45deg, #5e35b1, #3f51b5);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.creator-main-info {
  margin-top: 0.75rem;
}

.creator-main-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.85rem;
  color: #333;
  font-weight: 700;
}

.creator-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.creator-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
}

.creator-badge.verified {
  color: #2196f3;
  background: #e3f2fd;
}

.creator-badge.level {
  color: #ff9800;
  background: #fff3e0;
}

.creator-section {
  padding: 1.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.creator-section:last-child {
  border-bottom: none;
}

.creator-section h3 {
  margin: 0 0 1.25rem;
  color: #424242;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.creator-section h3::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  background: linear-gradient(to bottom, #673ab7, #3f51b5);
  margin-right: 10px;
  border-radius: 2px;
}

.creator-section p {
  line-height: 1.7;
  color: #555;
  font-size: 1.05rem;
}

.creator-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.detail-item i.material-icons {
  color: #673ab7;
  background: rgba(103, 58, 183, 0.1);
  padding: 8px;
  border-radius: 50%;
  font-size: 1.1rem;
}

.detail-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
}

.detail-value {
  font-size: 1.05rem;
  font-weight: 500;
  color: #333;
}

.offers-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.offer-tag {
  background: linear-gradient(to right, rgba(103, 58, 183, 0.1), rgba(63, 81, 181, 0.1));
  color: #673ab7;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.offer-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.07);
}

.document-links,
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.document-link,
.social-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  text-decoration: none;
  gap: 0.7rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.document-link {
  color: #2196f3;
  background: linear-gradient(to right, #e3f2fd, #bbdefb);
}

.social-link {
  color: #673ab7;
  background: linear-gradient(to right, #ede7f6, #d1c4e9);
}

.document-link:hover,
.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.document-link i,
.social-link i {
  font-size: 1.3rem;
}

.view-full-profile {
  background: linear-gradient(45deg, #673ab7, #3f51b5);
  color: white;
  padding: 0.85rem 1.2rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(103, 58, 183, 0.3);
}

.view-full-profile:hover {
  background: linear-gradient(45deg, #5e35b1, #3949ab);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(103, 58, 183, 0.4);
}

.rating-stats {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.5rem;
  background: linear-gradient(to right, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.1));
  border-radius: 12px;
}

.average-rating {
  text-align: center;
}

.rating-value {
  font-size: 3.5rem;
  font-weight: bold;
  color: #ff9800;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
  line-height: 1;
}

.stars {
  color: #ffd700;
  margin: 0.5rem 0;
}

.stars .material-icons.filled {
  color: #ffd700;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

.total-ratings {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Modal footer */
.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
}

.cancel-btn {
  background: linear-gradient(to right, #f5f5f5, #eeeeee);
  color: #555;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: linear-gradient(to right, #eeeeee, #e0e0e0);
}

/* Update modal header */
.modal-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .creator-details-grid {
    grid-template-columns: 1fr;
  }
  
  .creator-profile-main {
    bottom: -70px;
  }
  
  .creator-avatar-large {
    width: 130px;
    height: 130px;
  }
  
  .creator-section {
    padding: 1.25rem;
  }
  
  .document-links, 
  .social-links {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-footer button {
    width: 100%;
  }
}
</style>
  