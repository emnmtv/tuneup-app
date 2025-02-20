<template>
  <div class="app-container">
    <!-- Show sidebar only if not on login or register page -->
    <Sidenav v-if="showSidebar" :is-collapsed="isCollapsed" @toggle="toggleSidenav" />
    <div class="content" :style="{ marginLeft: isCollapsed ? '70px' : '250px' }">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidenav from "./components/Sidenav.vue";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";

export default {
  components: {
    Sidenav,
  },
  setup() {
    const route = useRoute();
    const isCollapsed = ref(false); // Track the collapsed state

    // Define routes where sidebar should NOT be shown
    const authRoutes = ["/", "/register"];

    // Show sidebar if NOT on auth routes (login & register)
    const showSidebar = computed(() => !authRoutes.includes(route.path));

    const toggleSidenav = () => {
      isCollapsed.value = !isCollapsed.value; // Toggle the collapsed state
    };

    return {
      showSidebar,
      isCollapsed,
      toggleSidenav,
    };
  },
};
</script>

<style>
.app-container {
  display: flex;
}

.content {
  flex-grow: 1;
  padding: 20px;
  height: calc(100vh - 0px); /* Adjust this value based on the height of the Sidenav */
  overflow-y: auto; /* Allow scrolling in the content area */
  transition: margin-left 0.3s ease; /* Add transition for margin-left */
  margin-left: 250px; /* Default margin for expanded state */
}

.content.collapsed {
  margin-left: 70px; /* Margin for collapsed state */
}
</style>
