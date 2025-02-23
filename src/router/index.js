import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import Dashboard from "../components/Dashboard.vue"; // New Dashboard Page
import Profile from "../components/Profile.vue";
import Settings from "../components/Settings.vue";
import RegisterPage from "../components/Register.vue"; // Import Register Component
import Upgrade from "../components/upgrade.vue"
import CreatorProfile from "../components/CreatorProfile.vue";
import CreatePost from "@/components/CreatePost.vue";
import Creatorpost from "@/components/Creatorpost.vue";
import PostDetails from "@/components/PostDetails.vue";
import Message from "@/components/Message.vue";
import LandingPage from '../components/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    beforeEnter: (to, from, next) => {
      // If user is authenticated, redirect to dashboard
      if (localStorage.getItem('token')) {
        next('/dashboard');
      } else {
        next();
      }
    }
  },
  { path: "/login", component: LoginPage },
  { path: "/dashboard", component: Dashboard },
  { path: "/profile", component: Profile },
  { path: "/settings", component: Settings },
  { path: "/register", component: RegisterPage }, // Register Route
  { path: "/upgrade", component: Upgrade}, // Register Route
  { path: "/creatorprofile", component: CreatorProfile}, // Register Route
  { path: "/createpost", component: CreatePost}, // Register Route
  { path: "/creatorpost", component: Creatorpost}, // Register Route
  { path: '/post/:postId', name: 'PostDetails', component: PostDetails },
 {path: '/messages', component: Message},


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');

  // Store the intended destination for post-login redirect
  if (to.path.startsWith('/post/') && !loggedIn) {
    sessionStorage.setItem('redirectAfterLogin', to.fullPath);
    return next('/login');
  }

  // Redirect to dashboard if logged-in user tries to access login/register
  if (loggedIn && ['/login', '/register'].includes(to.path)) {
    return next('/dashboard');
  }

  // Handle auth-required pages
  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
});

export default router;
