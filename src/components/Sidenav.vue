<template>
  <div class="sidenav" :class="{ 'collapsed': isCollapsed }">
    <div class="toggle-btn" @click="toggleNav">
      <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </div>

    <div class="nav-links">
      <template v-if="userRole && navigationItems[userRole]">
        <router-link 
          v-for="item in navigationItems[userRole]" 
          :key="item.path"
          :to="item.path"
          class="nav-link"
        >
          <i class="fas" :class="item.icon"></i>
          <span v-show="!isCollapsed">{{ item.name }}</span>
        </router-link>
      </template>
    </div>

    <button @click="logout" class="logout-btn">
      <i class="fas fa-sign-out-alt"></i>
      <span v-show="!isCollapsed">Logout</span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      userRole: null,
      navigationItems: {
        admin: [
          { name: 'Dashboard', path: '/admin-dashboard', icon: 'fa-home' },
          { name: 'Manage Users', path: '/admin/users', icon: 'fa-users' },
          { name: 'Manage Posts', path: '/admin/posts', icon: 'fa-tasks' },
          { name: 'Profile', path: '/profile', icon: 'fa-user' },
        ],
        creator: [
          { name: 'Dashboard', path: '/dashboard', icon: 'fa-home' },
          { name: 'Profile', path: '/profile', icon: 'fa-user' },
          { name: 'Creator Profile', path: '/creatorprofile', icon: 'fa-id-card' },
          { name: 'Create Post', path: '/createpost', icon: 'fa-plus-circle' },
          { name: 'Creator Posts', path: '/creatorpost', icon: 'fa-list' },
          { name: 'Messages', path: '/messages', icon: 'fa-envelope' },
        ],
        user: [
          { name: 'Upgrade to Creator', path: '/upgrade', icon: 'fa-arrow-up' },
          { name: 'Profile', path: '/profile', icon: 'fa-user' },
          { name: 'Dashboard', path: '/dashboard', icon: 'fa-home' },
          { name: 'Messages', path: '/messages', icon: 'fa-envelope' },
        ],
      }
    }
  },
  created() {
    // Get the role from localStorage when component is created
    this.userRole = localStorage.getItem('userRole')
  },
  methods: {
    toggleNav() {
      this.$emit('toggle'); // Emit toggle event to parent
    },
    logout() {
      // Clear both token and role
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userRole');
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.sidenav {
  width: 250px;
  height: 100vh; /* Full height of the viewport */
  background: #333;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 10px; /* Adjusted padding for better fit */
  position: fixed;
  transition: width 0.3s ease;
}

.sidenav.collapsed {
  width: 70px;
  padding: 20px 5px; /* Adjust padding for collapsed state */
}

@media (max-width: 768px) { /* Adjust for smaller screens */
  .sidenav {
    width: 100%; /* Full width on small screens */
    height: auto; /* Allow height to adjust */
    position: relative; /* Change position to relative */
  }

  .sidenav.collapsed {
    width: 100%; /* Full width when collapsed */
  }

  .toggle-btn {
    right: 10px; /* Adjust toggle button position */
  }
}

.toggle-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  background: #4CAF50;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.3s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sidenav a {
  color: white;
  text-decoration: none;
  padding: 12px 15px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.sidenav.collapsed a {
  padding: 12px;
  justify-content: center;
}

.sidenav a:hover {
  background: #555;
}

.sidenav a.router-link-active {
  background: #444;
  border-left: 4px solid #4CAF50;
}

.sidenav i {
  width: 20px;
  text-align: center;
}

.logout-btn {
  margin-top: auto;
  padding: 12px;
  border: none;
  background: #dc3545;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.sidenav.collapsed .logout-btn {
  justify-content: center;
}

.logout-btn:hover {
  background: #c82333;
}

/* Add tooltip for collapsed state */
.sidenav.collapsed a, 
.sidenav.collapsed .logout-btn {
  position: relative;
}

.sidenav.collapsed a:hover::after,
.sidenav.collapsed .logout-btn:hover::after {
  content: attr(to);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #555;
  padding: 5px 10px;
  border-radius: 4px;
  margin-left: 10px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1000;
}
</style>
