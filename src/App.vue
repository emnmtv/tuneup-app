<template>
  <div class="app-container">
    <!-- Use reactive isAuthenticated state -->
    <TopNav v-if="!isAuthRoute && isAuthenticated" @logout="handleLogout" />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import TopNav from './components/TopNav.vue';
import { useRoute } from "vue-router";
import { computed, ref, onMounted, onUnmounted, watch } from "vue";

export default {
  components: {
    TopNav,
  },
  setup() {
    const route = useRoute();
    const isMobile = ref(window.innerWidth <= 768);
    const isAuthenticated = ref(!!localStorage.getItem('token'));

    // Routes where TopNav should not be shown
    const authRoutes = ["/login", "/register"];
    const isAuthRoute = computed(() => authRoutes.includes(route.path));

    const handleLogout = () => {
      isAuthenticated.value = false;
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    // Watch for route changes to update authentication state
    watch(() => route.path, () => {
      isAuthenticated.value = !!localStorage.getItem('token');
    });

    onMounted(() => {
      window.addEventListener('resize', handleResize);
      isAuthenticated.value = !!localStorage.getItem('token');
      
      // Apply global styles to fix margin issues
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
    });
    
    onUnmounted(() => window.removeEventListener('resize', handleResize));

    return {
      isMobile,
      isAuthRoute,
      isAuthenticated,
      handleLogout,
    };
  },
};
</script>

<style>
/* Global styles to fix margin issues */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}
</style>

<style scoped>
/* Ensure the app takes the full height of the viewport */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5; /* Facebook-like background color */
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.content {
  flex-grow: 1;
  padding: 0;
  margin: 0;
  width: 100%;
  overflow-y: auto; /* Allow scroll only if content exceeds viewport */
  height: 100%;
  box-sizing: border-box;
}
</style>
