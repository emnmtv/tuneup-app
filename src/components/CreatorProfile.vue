<template>
  <div class="creator-profile-page">
    <div class="creator-profile-container">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="header-content">
          <h1>Creator Profile</h1>
          <p>Showcase your talents and services</p>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="message" :class="['alert', messageType]">
        <i class="material-icons">{{ messageType === 'success' ? 'check_circle' : 'error' }}</i>
        {{ message }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>

      <!-- Profile Form -->
      <form v-else @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-grid">
          <!-- Type of Profession -->
          <div class="form-group">
            <label>
              <i class="material-icons">work</i>
              Type of Profession
            </label>
            <select v-model="profile.typeOfProfession">
              <option value="">Select your profession type</option>
              <!-- String Instruments -->
              <optgroup label="String Instruments">
                <option value="Guitarist">Guitarist</option>
                <option value="Bassist">Bassist</option>
                <option value="Violinist">Violinist</option>
                <option value="Cellist">Cellist</option>
                <option value="Ukulele Player">Ukulele Player</option>
              </optgroup>
              
              <!-- Vocalists -->
              <optgroup label="Vocalists">
                <option value="Lead Vocalist">Lead Vocalist</option>
                <option value="Backing Vocalist">Backing Vocalist</option>
                <option value="Opera Singer">Opera Singer</option>
                <option value="Vocal Coach">Vocal Coach</option>
              </optgroup>
              
              <!-- Percussion -->
              <optgroup label="Percussion">
                <option value="Drummer">Drummer</option>
                <option value="Percussionist">Percussionist</option>
                <option value="Beatboxer">Beatboxer</option>
              </optgroup>
              
              <!-- Keys & Piano -->
              <optgroup label="Keys & Piano">
                <option value="Pianist">Pianist</option>
                <option value="Keyboardist">Keyboardist</option>
                <option value="Organist">Organist</option>
                <option value="Synthesizer">Synthesizer</option>
              </optgroup>
              
              <!-- Wind Instruments -->
              <optgroup label="Wind Instruments">
                <option value="Saxophonist">Saxophonist</option>
                <option value="Flutist">Flutist</option>
                <option value="Trumpeter">Trumpeter</option>
                <option value="Clarinetist">Clarinetist</option>
              </optgroup>
              
              <!-- Production & Engineering -->
              <optgroup label="Production & Engineering">
                <option value="Music Producer">Music Producer</option>
                <option value="Sound Engineer">Sound Engineer</option>
                <option value="Mixing Engineer">Mixing Engineer</option>
                <option value="Mastering Engineer">Mastering Engineer</option>
                <option value="Studio Manager">Studio Manager</option>
              </optgroup>
              
              <!-- Composition & Arrangement -->
              <optgroup label="Composition & Arrangement">
                <option value="Composer">Composer</option>
                <option value="Arranger">Arranger</option>
                <option value="Orchestrator">Orchestrator</option>
                <option value="Songwriter">Songwriter</option>
              </optgroup>
              
              <!-- Music Education -->
              <optgroup label="Music Education">
                <option value="Music Teacher">Music Teacher</option>
                <option value="Music Therapist">Music Therapist</option>
                <option value="Band Director">Band Director</option>
                <option value="Music Coach">Music Coach</option>
              </optgroup>
              
              <!-- Other Music Professionals -->
              <optgroup label="Other Music Professionals">
                <option value="DJ">DJ</option>
                <option value="Music Director">Music Director</option>
                <option value="Session Musician">Session Musician</option>
                <option value="Music Technician">Music Technician</option>
                <option value="Instrument Repair">Instrument Repair</option>
              </optgroup>
            </select>
          </div>

          <!-- Specific Profession -->
          <div class="form-group">
            <label>
              <i class="material-icons">person</i>
              Specific Profession
            </label>
            <input
              type="text"
              v-model="profile.profession"
              placeholder="e.g., Lead Guitarist, Session Musician"
            />
          </div>

          <!-- Genre -->
          <div class="form-group">
            <label>
              <i class="material-icons">music_note</i>
              Genre
            </label>
            <input
              type="text"
              v-model="profile.genre"
              placeholder="e.g., Rock, Jazz, Classical"
            />
          </div>

          <!-- Services Offered -->
          <div class="form-group full-width">
            <label>
              <i class="material-icons">list_alt</i>
              Services Offered
            </label>
            <input
              type="text"
              v-model="profile.offers"
              placeholder="e.g., Guitar Lessons, Session Recording, Music Production"
            />
            <span class="help-text">Separate multiple services with commas</span>
          </div>

          <!-- Bio -->
          <div class="form-group full-width">
            <label>
              <i class="material-icons">description</i>
              Bio
            </label>
            <textarea
              v-model="profile.bio"
              rows="4"
              placeholder="Tell potential clients about your experience, skills, and what makes you unique..."
            ></textarea>
            <span class="help-text">{{ bioCharactersLeft }} characters remaining</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="reset-btn">
            <i class="material-icons">refresh</i>
            Reset Changes
          </button>
          <button type="submit" class="save-btn" :disabled="loading">
            <i class="material-icons">save</i>
            {{ loading ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getCreatorProfile, editCreatorProfile } from "../authService";
import Swal from 'sweetalert2';

const profile = ref({
  offers: "",
  bio: "",
  profession: "",
  typeOfProfession: "",
  genre: "",
});

const loading = ref(false);
const message = ref("");
const messageType = ref("success");
const originalProfile = ref(null);

const BIO_MAX_LENGTH = 500;

const bioCharactersLeft = computed(() => {
  return BIO_MAX_LENGTH - (profile.value.bio?.length || 0);
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchProfile = async () => {
  try {
    loading.value = true;
    const data = await getCreatorProfile();
    profile.value = data.creatorProfile || profile.value;
    originalProfile.value = { ...profile.value };
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    // First ask for confirmation
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update your creator profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2196f3',
      cancelButtonColor: '#666'
    });

    if (!result.isConfirmed) {
      return;
    }

    loading.value = true;
    await editCreatorProfile(profile.value);
    
    await Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your creator profile has been successfully updated.',
      timer: 2000,
      showConfirmButton: false
    });
    
    originalProfile.value = { ...profile.value };
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message || 'Failed to update profile'
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = async () => {
  // Check if there are actual changes before showing the dialog
  const hasChanges = JSON.stringify(profile.value) !== JSON.stringify(originalProfile.value);
  
  if (!hasChanges) {
    return;
  }
  
  const result = await Swal.fire({
    title: 'Discard Changes?',
    text: 'You have unsaved changes. Are you sure you want to discard them?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, discard',
    cancelButtonText: 'No, keep editing',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#666'
  });

  if (result.isConfirmed) {
    profile.value = { ...originalProfile.value };
    await Swal.fire({
      icon: 'info',
      title: 'Changes Discarded',
      text: 'Your changes have been discarded.',
      timer: 1500,
      showConfirmButton: false
    });
  }
};

onMounted(fetchProfile);
</script>

<style scoped>
.creator-profile-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 2rem;
}

.creator-profile-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  padding: 2.5rem;
  color: white;
  text-align: center;
}

.profile-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.profile-header p {
  margin-top: 0.5rem;
  opacity: 0.9;
  font-size: 1.1rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
}

.alert.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.profile-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

.help-text {
  font-size: 0.85rem;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.save-btn,
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn:hover,
.reset-btn:hover {
  transform: translateY(-2px);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .creator-profile-page {
    padding: 1rem;
  }

  .profile-header {
    padding: 2rem 1rem;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn,
  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
  