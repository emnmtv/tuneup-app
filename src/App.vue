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

<style scoped>
/* Ensure the app takes the full height of the viewport */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent unnecessary scrolling */
}

.content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto; /* Allow scroll only if content exceeds viewport */
  height: 100%;
  box-sizing: border-box;
  margin: 0;
}
</style>
