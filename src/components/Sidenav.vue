<template>
  <div class="sidenav" :class="{ 'collapsed': isCollapsed }">
    <div class="toggle-btn" @click="toggleNav">
      <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </div>

    <!-- Common links for all users -->
    <div class="nav-links">
      <router-link to="/dashboard">
        <i class="fas fa-home"></i>
        <span v-show="!isCollapsed">Dashboard</span>
      </router-link>
      <router-link to="/profile">
        <i class="fas fa-user"></i>
        <span v-show="!isCollapsed">Profile</span>
      </router-link>
      <router-link to="/settings">
        <i class="fas fa-cog"></i>
        <span v-show="!isCollapsed">Settings</span>
      </router-link>

      <!-- Creator and Admin only links -->
      <template v-if="userRole === 'creator' || userRole === 'admin'">
        <router-link to="/creatorprofile">
          <i class="fas fa-id-card"></i>
          <span v-show="!isCollapsed">Creator Profile</span>
        </router-link>
        <router-link to="/createpost">
          <i class="fas fa-plus-circle"></i>
          <span v-show="!isCollapsed">Create Post</span>
        </router-link>
        <router-link to="/creatorpost">
          <i class="fas fa-list"></i>
          <span v-show="!isCollapsed">Creator Posts</span>
        </router-link>
      </template>

      <!-- Regular user only links -->
      <template v-if="userRole === 'user'">
        <router-link to="/upgrade">
          <i class="fas fa-arrow-up"></i>
          <span v-show="!isCollapsed">Upgrade to Creator</span>
        </router-link>
      </template>

      <!-- Admin only links -->
      <template v-if="userRole === 'admin'">
        <router-link to="/admin/users">
          <i class="fas fa-users"></i>
          <span v-show="!isCollapsed">Manage Users</span>
        </router-link>
        <router-link to="/admin/posts">
          <i class="fas fa-tasks"></i>
          <span v-show="!isCollapsed">Manage Posts</span>
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
  data() {
    return {
      userRole: null,
      isCollapsed: false
    }
  },
  created() {
    // Get the role from localStorage when component is created
    this.userRole = localStorage.getItem('userRole')
  },
  methods: {
    toggleNav() {
      this.isCollapsed = !this.isCollapsed
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
  height: 100vh;
  background: #333;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.sidenav.collapsed {
  width: 70px;
  padding: 20px 10px;
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
