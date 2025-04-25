<template>
  <div class="create-post-container">
    <div class="post-form-card">
      <div class="form-header">
        <h2>Create New Post</h2>
        <p>Share your content with the community</p>
      </div>

      <form @submit.prevent="handleSubmit" class="post-form">
        <!-- Title Input -->
        <div class="form-group">
          <label>
            <i class="material-icons">title</i>
            Title
          </label>
          <input 
            v-model="title" 
            placeholder="Enter a title for your post"
            required
          />
        </div>

        <!-- Description Input -->
        <div class="form-group">
          <label>
            <i class="material-icons">description</i>
            Description
          </label>
          <textarea 
            v-model="description" 
            placeholder="Brief description of your post"
            rows="3"
            required
          ></textarea>
        </div>

        <!-- Detailed Description -->
        <div class="form-group">
          <label>
            <i class="material-icons">article</i>
            Detailed Description
          </label>
          <textarea 
            v-model="detailedDescription" 
            placeholder="Provide more details about your post"
            rows="5"
          ></textarea>
        </div>

        <!-- Amount Input -->
        <div class="form-group">
          <label>
            <i class="material-icons">payments</i>
            Amount (₱)
          </label>
          <input 
            v-model="amount" 
            type="number" 
            min="0"
            step="0.01"
            placeholder="Enter amount (optional)"
          />
        </div>

        <!-- Remarks Input -->
        <div class="form-group">
          <label>
            <i class="material-icons">comment</i>
            Remarks
          </label>
          <input 
            v-model="remarks" 
            placeholder="Additional notes or remarks"
          />
        </div>

        <!-- Media Upload Section -->
        <div class="media-upload-section">
          <!-- Image Upload -->
          <div class="upload-group">
            <label class="upload-label" :class="{ 'has-file': image }">
              <i class="material-icons">{{ image ? 'check_circle' : 'image' }}</i>
              <span>{{ image ? 'Image Selected' : 'Upload Image' }}</span>
              <input 
                type="file" 
                @change="handleImageUpload" 
                accept="image/*"
                class="file-input"
              />
            </label>
            <div v-if="image" class="preview">
              <img :src="imagePreview" alt="Preview" />
              <button type="button" @click="removeImage" class="remove-btn">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>

          <!-- Video Upload -->
          <div class="upload-group">
            <label class="upload-label" :class="{ 'has-file': video }">
              <i class="material-icons">{{ video ? 'check_circle' : 'videocam' }}</i>
              <span>{{ video ? 'Video Selected' : 'Upload Video' }}</span>
              <input 
                type="file" 
                @change="handleVideoUpload" 
                accept="video/*"
                class="file-input"
              />
            </label>
            <div v-if="video" class="preview video-preview">
              <video :src="videoPreview" controls></video>
              <button type="button" @click="removeVideo" class="remove-btn">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>

          <!-- Audio Upload -->
          <div class="upload-group">
            <label class="upload-label" :class="{ 'has-file': audio }">
              <i class="material-icons">{{ audio ? 'check_circle' : 'audiotrack' }}</i>
              <span>{{ audio ? 'Audio Selected' : 'Upload Audio' }}</span>
              <input 
                type="file" 
                @change="handleAudioUpload" 
                accept="audio/*"
                class="file-input"
              />
            </label>
            <div class="file-size-warning">
              <i class="material-icons warning-icon">warning</i>
              Maximum file size: 20MB. Please compress larger files before uploading.
            </div>
            <div v-if="audio" class="preview audio-preview">
              <audio :src="audioPreview" controls class="audio-player"></audio>
              <div class="audio-info">
                <span class="audio-filename">{{ audio.name }}</span>
                <p class="audio-note">
                  <i class="material-icons info-icon">info</i>
                  Audio files will be automatically checked for copyright
                </p>
              </div>
              <button type="button" @click="removeAudio" class="remove-btn">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="reset-btn">
            <i class="material-icons">refresh</i>
            Reset
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <i class="material-icons">post_add</i>
            {{ isSubmitting ? 'Creating Post...' : 'Create Post' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { createPost } from '../authService';
import Swal from 'sweetalert2';

export default {
  setup() {
    const title = ref('');
    const description = ref('');
    const detailedDescription = ref('');
    const amount = ref(null);
    const remarks = ref('');
    const image = ref(null);
    const video = ref(null);
    const audio = ref(null);
    const imagePreview = ref('');
    const videoPreview = ref('');
    const audioPreview = ref('');
    const isSubmitting = ref(false);

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        image.value = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const handleVideoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        video.value = file;
        videoPreview.value = URL.createObjectURL(file);
      }
    };

    const handleAudioUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Check file size - limit to 20MB
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (file.size > maxSize) {
          Swal.fire({
            title: 'File Too Large',
            text: 'Audio file exceeds the 20MB limit. Please compress the file or choose a smaller one.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          event.target.value = ''; // Reset the input
          return;
        }
        
        audio.value = file;
        audioPreview.value = URL.createObjectURL(file);
      }
    };

    const removeImage = () => {
      image.value = null;
      imagePreview.value = '';
    };

    const removeVideo = () => {
      video.value = null;
      videoPreview.value = '';
    };

    const removeAudio = () => {
      audio.value = null;
      audioPreview.value = '';
    };

    const resetForm = async () => {
      const result = await Swal.fire({
        title: 'Reset Form?',
        text: 'This will clear all entered data. Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it',
        cancelButtonText: 'No, keep editing',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      });

      if (result.isConfirmed) {
        title.value = '';
        description.value = '';
        detailedDescription.value = '';
        amount.value = null;
        remarks.value = '';
        removeImage();
        removeVideo();
        removeAudio();
      }
    };

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Validate required fields
        if (!title.value || !title.value.trim()) {
          Swal.fire({
            title: 'Error',
            text: 'Please enter a title for your post',
            icon: 'error'
          });
          isSubmitting.value = false;
          return;
        }

        if (!description.value || !description.value.trim()) {
          Swal.fire({
            title: 'Error',
            text: 'Please enter a description for your post',
            icon: 'error'
          });
          isSubmitting.value = false;
          return;
        }

        // Confirm submission
        const result = await Swal.fire({
          title: 'Create Post?',
          text: audio.value ? 'Audio files will be scanned for copyright. This process may take a moment.' : 'Ready to publish your post?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Create',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#2196f3'
        });

        if (!result.isConfirmed) {
          isSubmitting.value = false;
          return;
        }

        // Log the form data for debugging
        console.log('Submitting post with title:', title.value);
        console.log('Submitting post with description:', description.value);

        const formData = new FormData();
        formData.append('title', title.value.trim());
        formData.append('description', description.value.trim());
        
        if (detailedDescription.value) {
          formData.append('detailedDescription', detailedDescription.value);
        }
        
        if (amount.value) {
          formData.append('amount', amount.value.toString());
        }
        
        if (remarks.value) {
          formData.append('remarks', remarks.value);
        }
        
        if (image.value) {
          formData.append('image', image.value);
        }
        
        if (video.value) {
          formData.append('video', video.value);
        }
        
        if (audio.value) {
          formData.append('audio', audio.value);
        }

        // Double check form data before sending
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        const response = await createPost(formData);
        
        // Make sure response has expected structure
        if (!response) {
          throw new Error('Invalid response from server');
        }
        
        // Get the post data - should be in response.post now
        const postData = response.post;
        
        // Check for copyright detection warning
        let copyrightMessage = '';
        
        if (postData && postData.copyrightInfo) {
          try {
            // Handle potentially truncated or malformed JSON
            let copyright;
            try {
              // Try to parse the JSON normally first
              copyright = typeof postData.copyrightInfo === 'string' 
                ? JSON.parse(postData.copyrightInfo) 
                : postData.copyrightInfo;
            } catch (jsonError) {
              console.error('Error parsing copyright info JSON:', jsonError);
              // If that fails, extract the song info from the truncated JSON if possible
              const songMatch = postData.copyrightInfo.match(/"title":"([^"]+)","artist":"([^"]+)"/);
              if (songMatch) {
                copyright = {
                  isDetected: true,
                  songInfo: {
                    title: songMatch[1] || 'Unknown',
                    artist: songMatch[2] || 'Unknown',
                  }
                };
              } else {
                // If we can't even extract partial info, just return a placeholder
                copyright = {
                  isDetected: true,
                  songInfo: {
                    title: 'Unknown Song',
                    artist: 'Unknown Artist',
                  },
                  error: 'Incomplete copyright data'
                };
              }
            }
              
            if (copyright.isDetected) {
              copyrightMessage = `
                <div class="copyright-alert">
                  <p><strong>Copyright detected in audio:</strong></p>
                  <p>${copyright.songInfo?.title || 'Unknown'} by ${copyright.songInfo?.artist || 'Unknown'}</p>
                  <p class="copyright-warning">Please ensure you have rights to use this audio.</p>
                </div>
              `;
            } else if (copyright.warning) {
              copyrightMessage = `
                <div class="copyright-warning">
                  <p><strong>Note:</strong> ${copyright.warning}</p>
                </div>
              `;
            }
          } catch (err) {
            console.error('Error handling copyright info:', err);
            // Add a generic copyright warning if everything else fails
            copyrightMessage = `
              <div class="copyright-warning">
                <p><strong>Note:</strong> Copyright detection was performed but results could not be displayed properly.</p>
                <p>Please ensure you have rights to any audio content you upload.</p>
              </div>
            `;
          }
        }

        Swal.fire({
          title: 'Post Created!',
          html: `Your post has been successfully published.${copyrightMessage}`,
          icon: 'success',
          confirmButtonText: 'OK',
          cancelButtonText: 'Create Another',
          showCancelButton: true,
          confirmButtonColor: '#2196f3'
        }).then((result) => {
          if (result.isConfirmed) {
            // DISABLE automatic redirection to view post
            // Just go to dashboard instead
            window.location.href = '/dashboard';
          } else {
            // Reset form for new post
            resetForm();
          }
        });
      } catch (error) {
        console.error('Error creating post:', error);
        
        let errorMessage = 'Failed to create post. Please try again.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      title,
      description,
      detailedDescription,
      amount,
      remarks,
      image,
      video,
      audio,
      imagePreview,
      videoPreview,
      audioPreview,
      isSubmitting,
      handleImageUpload,
      handleVideoUpload,
      handleAudioUpload,
      removeImage,
      removeVideo,
      removeAudio,
      resetForm,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.post-form-card {
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

.form-header h2 {
  margin: 0;
  font-size: 2rem;
}

.form-header p {
  margin-top: 0.5rem;
  opacity: 0.9;
}

.post-form {
  padding: 2rem;
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

.media-upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-label:hover {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.upload-label.has-file {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.file-input {
  display: none;
}

.preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.preview img,
.preview video {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-btn,
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

.submit-btn {
  background: #2196f3;
  color: white;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn:hover,
.reset-btn:hover {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.audio-preview {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.audio-player {
  width: 100%;
  margin-bottom: 0.5rem;
}

.audio-info {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.audio-filename {
  font-weight: 500;
  color: #555;
  word-break: break-all;
}

.audio-note {
  font-size: 0.85rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-icon {
  font-size: 1rem;
  color: #2196f3;
}

.file-size-warning {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.warning-icon {
  font-size: 1rem;
  color: #dc3545;
}

.copyright-alert {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  text-align: left;
}

.copyright-warning {
  margin-top: 0.5rem;
  color: #dc3545;
  font-weight: bold;
}

@media (max-width: 768px) {
  .media-upload-section {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>