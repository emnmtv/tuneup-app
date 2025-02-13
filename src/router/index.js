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
const routes = [
  { path: "/", component: LoginPage },
  { path: "/dashboard", component: Dashboard },
  { path: "/profile", component: Profile },
  { path: "/settings", component: Settings },
  { path: "/register", component: RegisterPage }, // Register Route
  { path: "/upgrade", component: Upgrade}, // Register Route
  { path: "/creatorprofile", component: CreatorProfile}, // Register Route
  { path: "/createpost", component: CreatePost}, // Register Route
  { path: "/creatorpost", component: Creatorpost}, // Register Route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
