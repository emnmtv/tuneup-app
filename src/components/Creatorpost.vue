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
      <div v-for="(post, ) in user.posts" :key="post.id" class="post">
        <h3 v-if="!post.isEditing" class="post-title">{{ post.title }}</h3>
        <input v-else v-model="post.title" class="post-title-input" />

        <p v-if="!post.isEditing" class="post-description">{{ post.description }}</p>
        <textarea v-else v-model="post.description" class="post-description-input"></textarea>

        <div v-if="post.image" class="post-media">
          <img :src="post.image" alt="Post image" class="post-image" />
        </div>

        <div v-if="post.video" class="post-media">
          <video controls :src="post.video" class="post-video"></video>
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
    },

    async savePost(post) {
  try {
    const updatedPostData = {
      title: post.title,
      description: post.description,
      // You can include other fields like image, video if needed
    };
    const updatedPost = await editPost(post.id, updatedPostData);
    if (updatedPost) {
      post.isEditing = false; // Stop editing once saved

      // Update the post array reactively
      const postIndex = this.user.posts.findIndex(p => p.id === post.id);
      if (postIndex !== -1) {
        // Using Vue.set to ensure reactivity
        this.$set(this.user.posts, postIndex, updatedPost);
        console.log('Post updated:', updatedPost);
      }
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
.post-title-input, .post-description-input {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
}

.edit-btn, .delete-btn {
  background-color: #f44336;
  color: white;
  padding: 10px;
}
</style>




<style scoped>
/* General styling for the profile */
.user-profile {
  font-family: Arial, sans-serif;
  margin: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 800px;
  margin: 0 auto;
}

.user-name {
  font-size: 2em;
  color: #333;
  margin-bottom: 10px;
}

.user-email,
.user-phone,
.user-address {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 5px;
}

.profile-info {
  margin-top: 30px;
}

.profile-info h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.profile-info p {
  font-size: 1.1em;
  color: #555;
}

.user-posts {
  margin-top: 30px;
}

.user-posts h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.post {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
}

.post-title {
  font-size: 1.3em;
  color: #333;
}

.post-description {
  font-size: 1.1em;
  color: #666;
}

.post-media {
  margin-top: 15px;
}

.post-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.post-video {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
