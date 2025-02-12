<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

// Search functionality
const searchQuery = ref("");
const performSearch = () => {
  console.log("Searching for:", searchQuery.value);
};

// Sidebar collapse state
const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Router instance
const router = useRouter();
const logout = () => {
  localStorage.removeItem("token"); // Remove token on logout
  router.push("/"); // Redirect to login
};
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <nav :class="['sidenav', { collapsed: isCollapsed }]">
      <button class="toggle-btn" @click="toggleSidebar">
        {{ isCollapsed ? "➡️" : "⬅️" }}
      </button>
      <h2 v-if="!isCollapsed">Menu</h2>
      <ul>
        <li>
          <router-link to="/dashboard">
            <span class="icon">🏠</span>
            <span v-if="!isCollapsed">Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile">
            <span class="icon">👤</span>
            <span v-if="!isCollapsed">Profile</span>
          </router-link>
        </li>
        <li>
          <router-link to="/settings">
            <span class="icon">⚙️</span>
            <span v-if="!isCollapsed">Settings</span>
          </router-link>
        </li>
        <li>
          <button @click="logout" class="logout-btn">
            <span class="icon">🚪</span>
            <span v-if="!isCollapsed">Logout</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation -->
      <header class="topnav">
        <input v-model="searchQuery" placeholder="Search..." @keyup.enter="performSearch" />
        <button @click="performSearch">🔍</button>
      </header>

      <router-view></router-view> <!-- Dynamic Route Rendering -->
    </div>
  </div>
</template>

<style scoped>
/* Layout */
.layout {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidenav {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidenav.collapsed {
  width: 60px;
}

.sidenav h2 {
  text-align: center;
}

.sidenav ul {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.sidenav ul li {
  padding: 10px;
}

.sidenav ul li a,
.sidenav ul li button {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 10px;
  font-size: 16px;
}

.sidenav ul li a:hover,
.sidenav ul li button:hover {
  background: #34495e;
  border-radius: 5px;
}

.icon {
  font-size: 18px;
}

/* Sidebar Toggle Button */
.toggle-btn {
  background: #34495e;
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
}

/* Top Navigation */
.topnav {
  background: #ecf0f1;
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.topnav input {
  padding: 8px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  width: 200px;
}

.topnav button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.topnav button:hover {
  background: #2980b9;
}

/* Main Content */
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Logout Button */
.logout-btn {
  color: red;
}
</style>
