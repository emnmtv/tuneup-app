<template>
  <div class="upgrade-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1>Become a Creator</h1>
      <p>Join our community of professional musicians and start sharing your talent</p>
    </div>

    <!-- Benefits Section -->
    <div class="benefits-section">
      <h2>Creator Benefits</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <i class="material-icons">store</i>
          <h3>Create Your Store</h3>
          <p>Showcase and sell your services to a global audience</p>
        </div>
        <div class="benefit-card">
          <i class="material-icons">trending_up</i>
          <h3>Grow Your Brand</h3>
          <p>Build your professional presence and expand your reach</p>
        </div>
        <div class="benefit-card">
          <i class="material-icons">people</i>
          <h3>Connect with Fans</h3>
          <p>Engage directly with your audience and build a following</p>
        </div>
        <div class="benefit-card">
          <i class="material-icons">payments</i>
          <h3>Earn Money</h3>
          <p>Monetize your skills and talents effectively</p>
        </div>
      </div>
    </div>

    <!-- Upgrade Form -->
    <div class="upgrade-form-container">
      <div class="form-header">
        <h2>Complete Your Creator Profile</h2>
        <p>Tell us about yourself and your musical journey</p>
      </div>

      <form @submit.prevent="handleSubmit" class="upgrade-form">
        <!-- Services Offered -->
        <div class="form-group">
          <label>
            <i class="material-icons">list_alt</i>
            Services Offered
          </label>
          <textarea 
            v-model="offers" 
            placeholder="List your services (e.g., Guitar Lessons, Music Production, Live Performance)"
            required
          ></textarea>
          <span class="help-text">Describe the services you'll provide to your clients</span>
        </div>

        <!-- Bio -->
        <div class="form-group">
          <label>
            <i class="material-icons">person</i>
            Bio
          </label>
          <textarea 
            v-model="bio" 
            placeholder="Share your story, experience, and what makes you unique"
            rows="5"
          ></textarea>
          <span class="help-text">Tell your story and showcase your experience</span>
        </div>

        <!-- Profession -->
        <div class="form-group">
          <label>
            <i class="material-icons">work</i>
            Profession
          </label>
          <input 
            type="text" 
            v-model="profession" 
            placeholder="Your primary musical profession"
            required
          />
        </div>

        <!-- Type of Profession -->
        <div class="form-group">
          <label>
            <i class="material-icons">category</i>
            Type of Profession
          </label>
          <select v-model="typeOfProfession" required>
            <option value="">Select your profession type</option>
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
        </div>

        <!-- Genre -->
        <div class="form-group">
          <label>
            <i class="material-icons">music_note</i>
            Genre
          </label>
          <input 
            type="text" 
            v-model="genre" 
            placeholder="Your primary music genre(s)"
            required
          />
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="loading"
          >
            <i class="material-icons">arrow_upward</i>
            {{ loading ? 'Upgrading...' : 'Upgrade to Creator' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { upgradeToCreator, logoutUser } from '../authService';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const router = useRouter();
    const offers = ref('');
    const bio = ref('');
    const profession = ref('');
    const typeOfProfession = ref('');
    const genre = ref('');
    const loading = ref(false);

    const handleLogout = async () => {
      try {
        await logoutUser();
        localStorage.clear();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        
        const result = await Swal.fire({
          title: 'Upgrade to Creator?',
          text: 'This will upgrade your account to creator status',
          html: 
            'After upgrading: <br>' +
            '1. You will be logged out automatically <br>' +
            '2. Log back in to access your new Creator features <br>' +
            '3. Your navigation menu will be updated with Creator options',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, upgrade now',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#2196f3',
          cancelButtonColor: '#666'
        });

        if (!result.isConfirmed) {
          return;
        }

        await upgradeToCreator({
          offers: offers.value,
          bio: bio.value,
          profession: profession.value,
          typeOfProfession: typeOfProfession.value,
          genre: genre.value
        });

        let timerInterval;
        await Swal.fire({
          title: 'Upgrade Successful!',
          html: 
            '<div class="upgrade-success">' +
            '<p>Your account has been upgraded to Creator status!</p>' +
            '<div class="next-steps">' +
            '<h3>Next Steps:</h3>' +
            '<ol>' +
            '<li>Logging out in <b></b> seconds...</li>' +
            '<li>Please log back in to access your Creator features</li>' +
            '<li>Your new Creator dashboard will be available</li>' +
            '</ol>' +
            '</div>' +
            '</div>',
          icon: 'success',
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false,
          didOpen: () => {
            const content = Swal.getHtmlContainer();
            const b = content.querySelector('b');
            timerInterval = setInterval(() => {
              b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          }
        });

        await handleLogout();

      } catch (error) {
        console.error('Upgrade failed:', error);
        Swal.fire({
          title: 'Upgrade Failed',
          text: error.message || 'Failed to upgrade account',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      offers,
      bio,
      profession,
      typeOfProfession,
      genre,
      loading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.upgrade-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.benefits-section {
  margin-bottom: 3rem;
}

.benefits-section h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
}

.benefit-card i {
  font-size: 2.5rem;
  color: #2196f3;
  margin-bottom: 1rem;
}

.benefit-card h3 {
  margin-bottom: 1rem;
}

.upgrade-form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 2rem;
  text-align: center;
}

.upgrade-form {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .upgrade-container {
    padding: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .upgrade-form {
    padding: 1.5rem;
  }
}

.upgrade-success {
  text-align: left;
  padding: 1rem;
}

.next-steps {
  margin-top: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.next-steps h3 {
  color: #2196f3;
  margin-bottom: 0.5rem;
}

.next-steps ol {
  margin: 0;
  padding-left: 1.5rem;
}

.next-steps li {
  margin: 0.5rem 0;
  color: #666;
}
</style>
