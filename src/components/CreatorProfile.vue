<template>
  <div class="creator-profile">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="material-icons error-icon">error_outline</i>
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="retry-btn">
        <i class="material-icons">refresh</i>
        Retry
      </button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="profile-content">
      <!-- Edit Mode Toggle -->
      <div class="edit-toggle">
        <button @click="toggleEditMode" class="edit-btn" :class="{ 'active': isEditMode }">
          <i class="material-icons">{{ isEditMode ? 'close' : 'edit' }}</i>
          {{ isEditMode ? 'Cancel Edit' : 'Edit Profile' }}
        </button>
      </div>

      <!-- Basic Info Section -->
      <div class="profile-header">
        <div class="cover-photo" :style="coverPhotoStyle">
          <div class="profile-picture" :style="profilePictureStyle">
            <div v-if="!profile.user.profilePicture" class="initials">
              {{ getInitials(profile.user.firstName, profile.user.lastName) }}
            </div>
          </div>
        </div>
        <div class="header-info">
          <h1>{{ profile.user.firstName }} {{ profile.user.lastName }}</h1>
          <div class="creator-status">
            <span v-if="!isEditMode" class="profession">{{ profile.profession }}</span>
            <input v-else v-model="editForm.profession" class="edit-input" placeholder="Your profession">
            <span v-if="profile.isVerified" class="verified-badge" title="Verified Creator">
              <i class="material-icons">verified</i>
            </span>
          </div>
          <div class="creator-level">
            <div class="level-info">
              <span class="level-label">Creator Level:</span>
              <div class="rating-stars">
                <div class="stars-outer">
                  <div class="stars-inner" :style="{ width: ratingPercentage + '%' }"></div>
                </div>
                <span class="rating-number">{{ profile.creatorLevel.toFixed(1) }}/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="profile-grid">
        <!-- Left Column -->
        <div class="profile-section main-info">
          <div class="section-content">
            <h2>About</h2>
            <template v-if="!isEditMode">
              <p class="bio">{{ profile.bio || 'No bio provided' }}</p>
            </template>
            <template v-else>
              <textarea v-model="editForm.bio" class="edit-textarea" placeholder="Tell your story"></textarea>
            </template>
            
            <h3>Services Offered</h3>
            <template v-if="!isEditMode">
              <div class="services">
                <div v-for="service in servicesArray" :key="service" class="service-tag">
                  {{ service }}
      </div>
      </div>
            </template>
            <template v-else>
              <textarea v-model="editForm.offers" class="edit-textarea" placeholder="List your services (comma-separated)"></textarea>
              <span class="help-text">Separate services with commas</span>
            </template>

            <h3>Profession Details</h3>
            <div class="details-grid">
              <div class="detail-item">
              <i class="material-icons">work</i>
                <span class="label">Type:</span>
                <template v-if="!isEditMode">
                  <span>{{ profile.typeOfProfession }}</span>
                </template>
                <template v-else>
                  <select v-model="editForm.typeOfProfession" class="edit-select">
                    <option value="">Select profession type</option>
              <optgroup label="String Instruments">
                <option value="Guitarist">Guitarist</option>
                <option value="Bassist">Bassist</option>
                <option value="Violinist">Violinist</option>
              </optgroup>
              <optgroup label="Percussion">
                <option value="Drummer">Drummer</option>
                <option value="Percussionist">Percussionist</option>
              </optgroup>
                    <optgroup label="Production">
                      <option value="Producer">Music Producer</option>
                <option value="Sound Engineer">Sound Engineer</option>
                <option value="Mixing Engineer">Mixing Engineer</option>
              </optgroup>
                    <optgroup label="Vocals">
                      <option value="Vocalist">Vocalist</option>
                      <option value="Vocal Coach">Vocal Coach</option>
              </optgroup>
            </select>
                </template>
              </div>
              <div class="detail-item">
                <i class="material-icons">music_note</i>
                <span class="label">Genre:</span>
                <template v-if="!isEditMode">
                  <span>{{ profile.genre }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.genre" class="edit-input" placeholder="Your music genres">
                </template>
              </div>
            </div>
          </div>
          </div>

        <!-- Right Column -->
        <div class="profile-section sidebar">
          <!-- Documents Section -->
          <div class="section-content documents">
            <h3>Documents</h3>
            <template v-if="!isEditMode">
              <div class="document-links">
                <a 
                  v-if="profile.portfolioFile" 
                  :href="getFileUrl(profile.portfolioFile)" 
                  target="_blank"
                  class="document-link"
                >
                  <i class="material-icons">folder</i>
                  View Portfolio
                </a>
                <a 
                  v-if="profile.resumeFile" 
                  :href="getFileUrl(profile.resumeFile)" 
                  target="_blank"
                  class="document-link"
                >
                  <i class="material-icons">description</i>
                  View Resume
                </a>
                <p v-if="!profile.portfolioFile && !profile.resumeFile" class="no-docs">
                  No documents available
                </p>
              </div>
            </template>
            <template v-else>
              <div class="file-upload-section">
                <div class="file-upload">
                  <label class="file-label">
                    <i class="material-icons">folder</i>
                    Portfolio (PDF/Images)
                    <input 
                      type="file" 
                      @change="handlePortfolioFile" 
                      accept=".pdf,image/*"
                      class="file-input"
                    >
            </label>
                  <span v-if="editForm.portfolioFile" class="file-name">
                    {{ editForm.portfolioFile.name }}
                  </span>
                </div>
                <div class="file-upload">
                  <label class="file-label">
                    <i class="material-icons">description</i>
                    Resume (PDF/DOC)
            <input
                      type="file" 
                      @change="handleResumeFile" 
                      accept=".pdf,.doc,.docx"
                      class="file-input"
                    >
                  </label>
                  <span v-if="editForm.resumeFile" class="file-name">
                    {{ editForm.resumeFile.name }}
                  </span>
                </div>
              </div>
            </template>
          </div>

          <!-- Social Links Section -->
          <div class="section-content social-links">
            <h3>Social Media</h3>
            <template v-if="!isEditMode">
              <div class="social-grid">
                <a 
                  v-for="link in profile.socialLinks" 
                  :key="link.id"
                  :href="link.url"
                  target="_blank"
                  class="social-link"
                  :title="link.platform"
                >
                  <i class="material-icons">{{ getSocialIcon(link.platform) }}</i>
                  <span>{{ link.platform }}</span>
                </a>
                <p v-if="!profile.socialLinks?.length" class="no-social">
                  No social links available
                </p>
              </div>
            </template>
            <template v-else>
              <div class="social-links-edit">
                <div v-for="(link, index) in editForm.socialLinks" :key="index" class="social-link-input">
                  <select v-model="link.platform" class="platform-select">
                    <option value="">Select Platform</option>
                    <option v-for="platform in socialPlatforms" :key="platform" :value="platform">
                      {{ platform }}
                    </option>
                  </select>
                  <input v-model="link.url" type="url" class="url-input" placeholder="Enter URL">
                  <button @click="removeSocialLink(index)" class="remove-link-btn" v-if="index > 0">
                    <i class="material-icons">remove_circle</i>
                  </button>
                </div>
                <button 
                  @click="addSocialLink" 
                  class="add-link-btn"
                  v-if="editForm.socialLinks.length < 5"
                >
                  <i class="material-icons">add_circle</i>
                  Add Social Link
                </button>
              </div>
            </template>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button v-if="isEditMode" @click="handleSave" class="save-btn" :disabled="saving">
              <i class="material-icons">save</i>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button v-else @click="handleContact" class="contact-btn">
              <i class="material-icons">mail</i>
              Contact Creator
            </button>
          </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { getCreatorProfile } from '../authService';
import { MEDIA_BASE_URL } from '../authService';
import Swal from 'sweetalert2';

export default {
  name: 'CreatorProfile',
  setup() {
    const profile = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const isEditMode = ref(false);
    const saving = ref(false);

    // Edit form state
    const editForm = reactive({
      offers: '',
      bio: '',
      profession: '',
      typeOfProfession: '',
      genre: '',
      portfolioFile: null,
      resumeFile: null,
      socialLinks: [{ platform: '', url: '' }]
});

    const socialPlatforms = [
      'Facebook',
      'Instagram',
      'Twitter',
      'YouTube',
      'LinkedIn',
      'SoundCloud',
      'Spotify',
      'TikTok',
      'Apple Music',
      'Amazon Music'
    ];

const fetchProfile = async () => {
  try {
    loading.value = true;
        error.value = null;
        const response = await getCreatorProfile();
        profile.value = response.creatorProfile;
        initializeEditForm();
      } catch (err) {
        error.value = err.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

    const initializeEditForm = () => {
      if (!profile.value) return;
      
      editForm.offers = profile.value.offers || '';
      editForm.bio = profile.value.bio || '';
      editForm.profession = profile.value.profession || '';
      editForm.typeOfProfession = profile.value.typeOfProfession || '';
      editForm.genre = profile.value.genre || '';
      editForm.portfolioFile = null;
      editForm.resumeFile = null;
      editForm.socialLinks = profile.value.socialLinks?.length 
        ? [...profile.value.socialLinks] 
        : [{ platform: '', url: '' }];
    };

    const toggleEditMode = () => {
      if (isEditMode.value) {
        // If canceling edit mode, reset form to current profile values
        initializeEditForm();
      }
      isEditMode.value = !isEditMode.value;
    };

    const handlePortfolioFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          Swal.fire({
            icon: 'error',
            title: 'File too large',
            text: 'Portfolio file must be less than 10MB'
          });
          return;
        }
        editForm.portfolioFile = file;
      }
    };

    const handleResumeFile = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          Swal.fire({
            icon: 'error',
            title: 'File too large',
            text: 'Resume file must be less than 5MB'
          });
          return;
        }
        editForm.resumeFile = file;
      }
    };

    const addSocialLink = () => {
      if (editForm.socialLinks.length < 5) {
        editForm.socialLinks.push({ platform: '', url: '' });
      }
    };

    const removeSocialLink = (index) => {
      editForm.socialLinks.splice(index, 1);
    };

    const validateSocialLinks = () => {
      return editForm.socialLinks.every(link => {
        if (!link.platform || !link.url) return false;
        try {
          new URL(link.url);
          return true;
        } catch {
          return false;
        }
      });
    };

    const handleSave = async () => {
      try {
        if (!editForm.offers.trim()) {
          throw new Error('Services offered is required');
        }

        // Validate social links
        const validSocialLinks = editForm.socialLinks.filter(link => link.platform && link.url);
        if (validSocialLinks.length && !validateSocialLinks()) {
          throw new Error('Please ensure all social media URLs are valid');
        }

        saving.value = true;

        const formData = new FormData();
        formData.append('offers', editForm.offers);
        formData.append('bio', editForm.bio);
        formData.append('profession', editForm.profession);
        formData.append('typeOfProfession', editForm.typeOfProfession);
        formData.append('genre', editForm.genre);

        if (editForm.portfolioFile) {
          formData.append('portfolioFile', editForm.portfolioFile);
        }
        if (editForm.resumeFile) {
          formData.append('resumeFile', editForm.resumeFile);
    }

        // Only include valid social links
        if (validSocialLinks.length) {
          formData.append('socialLinks', JSON.stringify(validSocialLinks));
        }

        const response = await fetch(`${MEDIA_BASE_URL}/auth/editcprofile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update profile');
        }

        await fetchProfile();
        isEditMode.value = false;
        
        Swal.fire({
      icon: 'success',
          title: 'Profile Updated',
          text: 'Your creator profile has been updated successfully',
          showConfirmButton: false,
          timer: 2000
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message || 'Failed to update profile'
    });
  } finally {
        saving.value = false;
  }
};

    const getInitials = (firstName, lastName) => {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const getFileUrl = (filename) => {
      return `${MEDIA_BASE_URL}/uploads/documents/${filename}`;
    };

    const getSocialIcon = (platform) => {
      const icons = {
        Facebook: 'facebook',
        Instagram: 'photo_camera',
        Twitter: 'twitter',
        YouTube: 'play_circle',
        LinkedIn: 'business',
        SoundCloud: 'audiotrack',
        Spotify: 'music_note',
        TikTok: 'movie',
        'Apple Music': 'music_note',
        'Amazon Music': 'music_note',
        default: 'link'
      };
      return icons[platform] || icons.default;
    };

    const handleContact = () => {
      // Implement contact functionality
    };

    // Computed properties
    const coverPhotoStyle = computed(() => ({
      backgroundImage: profile.value?.user.coverPhoto 
        ? `url(${MEDIA_BASE_URL}/uploads/${profile.value.user.coverPhoto})`
        : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'
    }));

    const profilePictureStyle = computed(() => ({
      backgroundImage: profile.value?.user.profilePicture 
        ? `url(${MEDIA_BASE_URL}/uploads/${profile.value.user.profilePicture})`
        : 'none'
    }));

    const servicesArray = computed(() => 
      profile.value?.offers ? profile.value.offers.split(',').map(s => s.trim()) : []
    );

    const ratingPercentage = computed(() => 
      ((profile.value?.creatorLevel || 0) / 5) * 100
    );

    onMounted(fetchProfile);

    return {
      profile,
      loading,
      error,
      isEditMode,
      saving,
      editForm,
      socialPlatforms,
      getInitials,
      getFileUrl,
      getSocialIcon,
      handleContact,
      coverPhotoStyle,
      profilePictureStyle,
      servicesArray,
      ratingPercentage,
      fetchProfile,
      toggleEditMode,
      handlePortfolioFile,
      handleResumeFile,
      addSocialLink,
      removeSocialLink,
      handleSave
    };
  }
};
</script>

<style scoped>
.creator-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
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

.edit-toggle {
  text-align: right;
  margin-bottom: 1rem;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #e0e0e0;
}

.edit-btn.active {
  background: #2196f3;
  color: white;
}

.profile-header {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.cover-photo {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 4px solid white;
  position: absolute;
  bottom: -50px;
  left: 2rem;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.initials {
  font-size: 3rem;
  color: #666;
}

.header-info {
  padding: 4rem 2rem 2rem;
}

.creator-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.verified-badge {
  color: #2196f3;
}

.creator-level {
  margin-top: 1rem;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars-outer {
  position: relative;
  display: inline-block;
  width: 100px;
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ddd"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>') repeat-x;
  background-size: 20px;
}

.stars-inner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffc107"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>') repeat-x;
  background-size: 20px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.profile-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-content {
  padding: 2rem;
}

.services {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.service-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.details-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item .label {
  font-weight: 500;
  margin-right: 0.5rem;
}

/* Edit Mode Styles */
.edit-input,
.edit-select,
.edit-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: white;
}

.edit-textarea {
  min-height: 100px;
  resize: vertical;
}

.edit-input:focus,
.edit-select:focus,
.edit-textarea:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
  display: block;
}

.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-upload {
  position: relative;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-label:hover {
  background: #e0e0e0;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.file-name {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.social-links-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-link-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.platform-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.url-input {
  flex: 2;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.add-link-btn,
.remove-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-link-btn {
  background: #4caf50;
  color: white;
  margin-top: 0.5rem;
}

.remove-link-btn {
  background: none;
  color: #f44336;
  padding: 0;
}

.add-link-btn:hover {
  background: #388e3c;
}

.remove-link-btn:hover {
  color: #d32f2f;
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.save-btn,
.contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #1976d2;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.contact-btn {
  background: #4caf50;
  color: white;
}

.contact-btn:hover {
  background: #388e3c;
}

@media (max-width: 768px) {
  .creator-profile {
    padding: 1rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
    bottom: -40px;
  }

  .header-info {
    padding: 3rem 1rem 1rem;
  }

  .initials {
    font-size: 2.5rem;
  }

  .social-link-input {
    flex-direction: column;
  }

  .platform-select,
  .url-input {
    width: 100%;
  }
}
</style>
  