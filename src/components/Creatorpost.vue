<template>
  <div v-if="user" class="user-profile">
    <h1 class="user-name">{{ user.firstName }} {{ user.lastName }}</h1>
    <p class="user-email">{{ user.email }}</p>
    <p class="user-phone">{{ user.phoneNumber }}</p>
    <p class="user-address">{{ user.address }}</p>

    <div v-if="user.creatorProfile" class="profile-info">
      <h2>Profile Information</h2>
      <p><strong>Offers:</strong> {{ user.creatorProfile.offers }}</p>
      <p><strong>Bio:</strong> {{ user.creatorProfile.bio }}</p>
      <p><strong>Profession:</strong> {{ user.creatorProfile.profession }}</p>
      <p><strong>Genre:</strong> {{ user.creatorProfile.genre }}</p>
    </div>

    <div v-if="user.posts && user.posts.length" class="user-posts">
      <h2>Posts</h2>
      <div v-for="post in user.posts" :key="post.id" class="post">
        <!-- Title -->
        <h3 v-if="!post.isEditing" class="post-title">{{ post.title }}</h3>
        <input v-else v-model="post.editedTitle" class="post-title-input" />

        <!-- Description -->
        <p v-if="!post.isEditing" class="post-description">{{ post.description }}</p>
        <textarea v-else v-model="post.editedDescription" class="post-description-input"></textarea>

        <!-- Detailed Description -->
        <p v-if="!post.isEditing" class="post-detailed-description">{{ post.detailedDescription }}</p>
        <textarea v-else v-model="post.editedDetailedDescription" class="post-detailed-description-input"></textarea>

        <!-- Amount -->
        <p v-if="!post.isEditing" class="post-amount">Amount: {{ post.amount }}</p>
        <input v-else v-model="post.editedAmount" type="number" class="post-amount-input" />

        <!-- Remarks -->
        <p v-if="!post.isEditing" class="post-remarks">Remarks: {{ post.remarks }}</p>
        <input v-else v-model="post.editedRemarks" class="post-remarks-input" />

        <!-- Image -->
        <div v-if="post.image" class="post-media">
          <img :src="post.image" alt="Post image" class="post-image" />
        </div>
        <div v-if="post.isEditing">
          <input type="file" @change="handleImageUpload(post, $event)" accept="image/*" />
          <button v-if="post.newImage" @click="post.newImage = null">Remove New Image</button>
        </div>

        <!-- Video -->
        <div v-if="post.video" class="post-media">
          <video controls :src="post.video" class="post-video"></video>
        </div>
        <div v-if="post.isEditing">
          <input type="file" @change="handleVideoUpload(post, $event)" accept="video/*" />
          <button v-if="post.newVideo" @click="post.newVideo = null">Remove New Video</button>
        </div>

        <!-- Edit and Delete Buttons -->
        <button v-if="!post.isEditing" @click="startEditing(post)" class="edit-btn">Edit</button>
        <button v-if="post.isEditing" @click="savePost(post)" class="save-btn">Save</button>
        <button @click="deletePost(post.id)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUserProfileAndPosts, editPost, deletePost } from '../authService.js';

export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    try {
      const userData = await fetchUserProfileAndPosts();
      if (userData) {
        this.user = userData;
        console.log('User data fetched:', userData);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  },
  methods: {
    startEditing(post) {
      // Start editing the post
      post.isEditing = true;
      post.editedTitle = post.title;
      post.editedDescription = post.description;
      post.editedDetailedDescription = post.detailedDescription;
      post.editedAmount = post.amount;
      post.editedRemarks = post.remarks;
      post.newImage = null;
      post.newVideo = null;
    },

    handleImageUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        post.newImage = file;
      }
    },

    handleVideoUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        post.newVideo = file;
      }
    },

    async savePost(post) {
      try {
        const postData = {
          title: post.editedTitle,
          description: post.editedDescription,
          detailedDescription: post.editedDetailedDescription,
          amount: post.editedAmount,
          remarks: post.editedRemarks,
          image: post.newImage || post.image,
          video: post.newVideo || post.video,
        };

        const updatedPost = await editPost(post.id, postData);
        if (updatedPost) {
          post.isEditing = false;
          Object.assign(post, updatedPost); // Directly update the post object
          console.log('Post updated:', updatedPost);
        }
      } catch (error) {
        console.error('Error editing post:', error);
      }
    },

    async deletePost(postId) {
      try {
        const result = await deletePost(postId);
        if (result) {
          this.user.posts = this.user.posts.filter(post => post.id !== postId);
          console.log('Post deleted:', postId);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    },
  },
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.user-name {
  font-size: 24px;
  margin-bottom: 10px;
}

.user-email,
.user-phone,
.user-address {
  margin-bottom: 5px;
}

.profile-info {
  margin-top: 20px;
}

.user-posts {
  margin-top: 20px;
}

.post {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.post-title {
  font-size: 18px;
  margin-bottom: 5px;
}

.post-description,
.post-detailed-description,
.post-amount,
.post-remarks {
  margin-bottom: 10px;
}

.post-media {
  margin-bottom: 10px;
}

.post-image {
  max-width: 100%;
  height: auto;
}

.post-video {
  max-width: 100%;
  height: auto;
}

.edit-btn,
.save-btn,
.delete-btn {
  margin-right: 10px;
}
</style>