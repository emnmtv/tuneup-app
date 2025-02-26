<template>
  <div class="topnav">
    <div class="nav-left">
      <button class="toggle-btn" @click="toggleNav">
        <i class="material-icons">menu</i>
      </button>
      <router-link 
        :to="isLoggedIn ? '/dashboard' : '/'" 
        class="brand"
      >
        TuneUp
      </router-link>
    </div>

    <div class="nav-links" v-if="userRole && navigationItems[userRole]">
      <router-link
        v-for="item in navigationItems[userRole]"
        :key="item.path"
        :to="item.path"
        class="nav-link"
      >
        <i class="material-icons">{{ item.icon }}</i>
        <span>{{ item.name }}</span>
      </router-link>
    </div>

    <div class="nav-right">
      <button @click="logout" class="logout-btn">
        <i class="material-icons">logout</i>
        <span>Logout</span>
      </button>
    </div>
  </div>

  <div v-if="isCollapsed" class="mobile-menu">
    <router-link
      v-for="item in navigationItems[userRole]"
      :key="item.path"
      :to="item.path"
      class="mobile-link"
    >
      {{ item.name }}
    </router-link>
  </div>
</template>

<script>
import { logoutUser } from '../authService';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/dist/sweetalert2.min.css';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      isCollapsed: false,
      userRole: null,
      navigationItems: {
        admin: [
          { name: 'Dashboard', path: '/admin-dashboard', icon: 'dashboard' },
          { name: 'Manage Users', path: '/admin/users', icon: 'people' },
          { name: 'Manage Posts', path: '/admin/posts', icon: 'assignment' },
          { name: 'Profile', path: '/profile', icon: 'person' },
        ],
        creator: [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Profile', path: '/profile', icon: 'person' },
          { name: 'Creator Profile', path: '/creatorprofile', icon: 'badge' },
          { name: 'Create Post', path: '/createpost', icon: 'add_circle' },
          { name: 'Creator Posts', path: '/creatorpost', icon: 'list' },
          { name: 'Messages', path: '/messages', icon: 'message' },
          { name: 'Client Orders', path: '/user-payments', icon: 'payment' },
        ],
        user: [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Upgrade to Creator', path: '/upgrade', icon: 'arrow_upward' },
          { name: 'Profile', path: '/profile', icon: 'person' },
          { name: 'Orders', path: '/client-payments', icon: 'payment' },
          { name: 'Messages', path: '/messages', icon: 'message' },
        ],
      },
    };
  },
  created() {
    this.userRole = localStorage.getItem('userRole');
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    toggleNav() {
      this.isCollapsed = !this.isCollapsed;
    },
    async logout() {
      try {
        const success = logoutUser();
        if (success) {
          // Emit logout event to parent
          this.$emit('logout');
          
          await Swal.fire({
            title: 'Logged Out',
            text: 'You have been successfully logged out',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          
          // Clear any stored data
          this.userRole = null;
          this.isCollapsed = false;
          
          // Redirect to landing page
          this.router.push('/');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Failed to logout. Please try again.',
          icon: 'error'
        });
      }
    },
  },
};
</script>

<style scoped>
.topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand {
  font-size: 20px;
  font-weight: bold;
  color: black;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: black;
  text-decoration: none;
  padding: 5px 10px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: #f0f0f0;
  border-radius: 5px;
}

.nav-right {
  display: flex;
  align-items: center;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
}

.logout-btn {
  background-color: #888585;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.logout-btn:hover {
  background-color: #14995b;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  background-color: white;
  padding: 10px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.mobile-link {
  padding: 10px 20px;
  text-decoration: none;
  color: black;
  transition: background-color 0.3s ease;
}

.mobile-link:hover {
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>
