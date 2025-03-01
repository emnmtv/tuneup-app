<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>

    <!-- Posts Management Section -->
    <div class="posts-section">
      <h2>Posts Management</h2>
      
      <!-- Posts Table -->
      <div class="posts-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Creator</th>
              <th>Title</th>
              <th>Media</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>{{ formatDate(post.createdAt) }}</td>
              <td>{{ post.user.firstName }} {{ post.user.lastName }}</td>
              <td>
                <a href="#" @click.prevent="showPostDetails(post)" class="post-title">
                  {{ post.title }}
                </a>
              </td>
              <td class="media-preview">
                <img v-if="post.image" :src="post.image" alt="Post image" @click="showMedia(post, 'image')" />
                <video v-if="post.video" :src="post.video" @click="showMedia(post, 'video')"></video>
              </td>
              <td>{{ truncateText(post.description, 50) }}</td>
              <td>₱{{ formatPeso(post.amount) }}</td>
              <td>
                <span class="status-badge" :class="post.status">
                  {{ post.status }}
                </span>
              </td>
              <td class="actions">
                <button 
                  v-if="post.status === 'pending' || post.status === 'rejected'"
                  @click="approvePost(post.id)" 
                  class="btn-approve"
                >
                  <span class="material-icons">check_circle</span>
                  {{ post.status === 'rejected' ? 'Re-approve' : 'Approve' }}
                </button>
                <button 
                  v-if="post.status === 'pending' || post.status === 'approved'"
                  @click="rejectPost(post.id)" 
                  class="btn-reject"
                >
                  <span class="material-icons">cancel</span>
                  Reject
                </button>
                <button 
                  @click="confirmDelete(post.id)" 
                  class="btn-delete"
                >
                  <span class="material-icons">delete</span>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Post Details Modal -->
    <div v-if="selectedPost" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">
          <span class="material-icons">close</span>
        </button>
        
        <h2>{{ selectedPost.title }}</h2>
        
        <div class="media-section">
          <img v-if="selectedPost.image" :src="selectedPost.image" alt="Post image" class="post-media" />
          <video 
            v-if="selectedPost.video" 
            :src="selectedPost.video" 
            controls 
            class="post-media"
          ></video>
        </div>

        <div class="post-info">
          <div class="info-row">
            <span class="label">Creator:</span>
            <span class="value">{{ selectedPost.user.firstName }} {{ selectedPost.user.lastName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Amount:</span>
            <span class="value">₱{{ formatPeso(selectedPost.amount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge" :class="selectedPost.status">
              {{ selectedPost.status }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(selectedPost.createdAt) }}</span>
          </div>
        </div>

        <div class="description-section">
          <h3>Description</h3>
          <p>{{ selectedPost.description }}</p>
        </div>

        <div v-if="selectedPost.detailedDescription" class="description-section">
          <h3>Detailed Description</h3>
          <p>{{ selectedPost.detailedDescription }}</p>
        </div>

        <div class="modal-actions">
          <button 
            v-if="selectedPost.status === 'pending' || selectedPost.status === 'rejected'"
            @click="approvePost(selectedPost.id)" 
            class="btn-approve"
          >
            <span class="material-icons">check_circle</span>
            {{ selectedPost.status === 'rejected' ? 'Re-approve' : 'Approve' }}
          </button>
          <button 
            v-if="selectedPost.status === 'pending' || selectedPost.status === 'approved'"
            @click="rejectPost(selectedPost.id)" 
            class="btn-reject"
          >
            <span class="material-icons">cancel</span>
            Reject
          </button>
          <button 
            @click="confirmDelete(selectedPost.id)" 
            class="btn-delete"
          >
            <span class="material-icons">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { updatePostStatus, deletePostAdmin, fetchAllPostsAdmin } from '../authService';
import { formatPeso } from '../utils/currencyFormatter';
import Swal from 'sweetalert2';

export default {
  name: 'AdminDashboard',
  setup() {
    const posts = ref([]);
    const selectedPost = ref(null);

    const fetchPosts = async () => {
      try {
        const data = await fetchAllPostsAdmin();
        posts.value = data;
      } catch (error) {
        console.error('Error fetching posts:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch posts',
          text: error.message
        });
      }
    };

    const approvePost = async (postId) => {
      try {
        await updatePostStatus(postId, 'approved');
        await fetchPosts(); // Refresh the list
        Swal.fire({
          icon: 'success',
          title: 'Post approved successfully',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to approve post',
          text: error.message
        });
      }
    };

    const rejectPost = async (postId) => {
      try {
        await updatePostStatus(postId, 'rejected');
        await fetchPosts(); // Refresh the list
        Swal.fire({
          icon: 'success',
          title: 'Post rejected',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to reject post',
          text: error.message
        });
      }
    };

    const confirmDelete = async (postId) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        try {
          await deletePostAdmin(postId);
          await fetchPosts(); // Refresh the list
          Swal.fire(
            'Deleted!',
            'Post has been deleted.',
            'success'
          );
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete post',
            text: error.message
          });
        }
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const truncateText = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    const showPostDetails = (post) => {
      selectedPost.value = post;
    };

    const closeModal = () => {
      selectedPost.value = null;
    };

    const showMedia = (post, type) => {
      const url = type === 'image' ? post.image : post.video;
      if (type === 'image') {
        Swal.fire({
          imageUrl: url,
          imageAlt: 'Post image',
          width: '80%'
        });
      } else {
        Swal.fire({
          html: `<video src="${url}" controls style="max-width: 100%;"></video>`,
          width: '80%'
        });
      }
    };

    onMounted(fetchPosts);

    return {
      posts,
      selectedPost,
      approvePost,
      rejectPost,
      confirmDelete,
      formatDate,
      formatPeso,
      truncateText,
      showPostDetails,
      closeModal,
      showMedia
    };
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.posts-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  color: #666;
  background: #f8f9fa;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-approve, .btn-reject, .btn-delete {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-approve {
  background: #28a745;
  color: white;
}

.btn-reject {
  background: #ffc107;
  color: #000;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-approve:hover { background: #218838; }
.btn-reject:hover { background: #e0a800; }
.btn-delete:hover { background: #c82333; }

.material-icons {
  font-size: 1.1rem;
}

@media (max-width: 1024px) {
  .actions {
    flex-direction: column;
  }
  
  .btn-approve, .btn-reject, .btn-delete {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  th, td {
    padding: 0.75rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.75rem;
  }
}

.media-preview {
  display: flex;
  gap: 0.5rem;
}

.media-preview img,
.media-preview video {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.media-preview img:hover,
.media-preview video:hover {
  transform: scale(1.1);
}

.post-title {
  color: #007bff;
  text-decoration: none;
}

.post-title:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.media-section {
  margin: 1.5rem 0;
  text-align: center;
}

.post-media {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.post-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.description-section {
  margin: 1.5rem 0;
}

.description-section h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}
</style> 