import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { ObserveVisibility } from 'vue-observe-visibility';

// Initialize session tracking for analytics
if (!sessionStorage.getItem('pageSessionStart')) {
  sessionStorage.setItem('pageSessionStart', Date.now().toString());
}

// Reset session timer on page navigation
router.beforeEach((to, from, next) => {
  // Track page changes for analytics
  sessionStorage.setItem('pageSessionStart', Date.now().toString());
  next();
});

const app = createApp(App);
app.use(router);
app.directive('observe-visibility', ObserveVisibility);
app.mount("#app");
