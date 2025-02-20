<template>
  <div class="app-container">
    <!-- Show TopNav only if not on login or register page -->
    <TopNav v-if="!isAuthRoute" />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import TopNav from './components/TopNav.vue';
import { useRoute } from "vue-router";
import { computed, ref, onMounted, onUnmounted } from "vue";

export default {
  components: {
    TopNav,
  },
  setup() {
    const route = useRoute();
    const isMobile = ref(window.innerWidth <= 768);

    // Routes where TopNav should not be shown
    const authRoutes = ["/", "/register"];
    const isAuthRoute = computed(() => authRoutes.includes(route.path));

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    onMounted(() => window.addEventListener('resize', handleResize));
    onUnmounted(() => window.removeEventListener('resize', handleResize));

    return {
      isMobile,
      isAuthRoute,
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
