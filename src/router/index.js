import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue"; // Updated name

const routes = [
  { path: "/", component: LoginPage },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
