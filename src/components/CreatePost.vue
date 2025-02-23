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
    const imagePreview = ref('');
    const videoPreview = ref('');
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

    const removeImage = () => {
      image.value = null;
      imagePreview.value = '';
    };

    const removeVideo = () => {
      video.value = null;
      videoPreview.value = '';
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
      }
    };

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Confirm submission
        const result = await Swal.fire({
          title: 'Create Post?',
          text: 'Are you sure you want to create this post?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, create it',
          cancelButtonText: 'No, review again',
          confirmButtonColor: '#2196f3',
          cancelButtonColor: '#6c757d'
        });

        if (!result.isConfirmed) {
          isSubmitting.value = false;
          return;
        }

        const postData = {
          title: title.value,
          description: description.value,
          detailedDescription: detailedDescription.value,
          amount: amount.value,
          remarks: remarks.value,
          image: image.value,
          video: video.value,
        };

        await createPost(postData);

        await Swal.fire({
          icon: 'success',
          title: 'Post Created!',
          text: 'Your post has been created successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        // Reset form after successful submission
        title.value = '';
        description.value = '';
        detailedDescription.value = '';
        amount.value = null;
        remarks.value = '';
        removeImage();
        removeVideo();

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: error.message || 'Failed to create post',
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
      imagePreview,
      videoPreview,
      isSubmitting,
      handleImageUpload,
      handleVideoUpload,
      removeImage,
      removeVideo,
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
  grid-template-columns: 1fr 1fr;
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