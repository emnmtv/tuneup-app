import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import Dashboard from "../components/Dashboard.vue"; // New Dashboard Page
import Profile from "../components/Profile.vue";
import Settings from "../components/Settings.vue";
import RegisterPage from "../components/Register.vue"; // Import Register Component
import ForgotPassword from "../components/ForgotPassword.vue"; // Import ForgotPassword Component
import Upgrade from "../components/upgrade.vue"
import CreatorProfile from "../components/CreatorProfile.vue";
import CreatePost from "@/components/CreatePost.vue";
import Creatorpost from "@/components/Creatorpost.vue";
import PostDetails from "@/components/PostDetails.vue";
import Message from "@/components/Message.vue";
import LandingPage from '../components/LandingPage.vue'
import UserPayments from "../components/UserPayments.vue";
import ClientPayments from "../components/ClientPayments.vue";
import AdminDashboard from '../components/AdminDashboard.vue';
import ViewClientPaymentDetails from '../components/ViewClientPaymentDetails.vue'; // Import the client payment details component
import ViewUserPaymentDetails from '../components/ViewUserPaymentDetails.vue'; // Import the user payment details component
import CreatorDashboard from '../components/CreatorDashboard.vue'; // Import the creator dashboard component
import ManageUsers from '../components/ManageUsers.vue'
import AdminUserReviewView from '@/views/AdminUserReviewView.vue';
import NotificationsView from '@/views/NotificationsView.vue'; // Import the notifications view component
import AdminAnalyticsView from '@/views/AdminAnalyticsView.vue'; // Import the admin analytics view component

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
  { path: "/forgot-password", component: ForgotPassword }, // Forgot Password Route
  { path: "/upgrade", component: Upgrade}, // Register Route
  { path: "/creatorprofile", component: CreatorProfile}, // Register Route
  { path: "/createpost", component: CreatePost}, // Register Route
  { path: "/creatorpost", component: Creatorpost}, // Register Route
  { path: '/post/:postId', name: 'PostDetails', component: PostDetails },
  { path: '/messages', component: Message},
 { path: "/user-payments", component: UserPayments },
 { path: "/client-payments", component: ClientPayments },
 { path: "/creator/:creatorId", component: CreatorProfile },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsView,
    meta: { requiresAuth: true }
  },
 {
   path: '/client/payment/:referenceNumber', // Route for client payment details
   name: 'ViewClientPaymentDetails',
   component: ViewClientPaymentDetails,
 },
 {
   path: '/user/payment/:referenceNumber', // Route for user payment details
   name: 'ViewUserPaymentDetails',
   component: ViewUserPaymentDetails,
 },
{path:"/creator-dashboard", component: CreatorDashboard},
{
  path: '/admin-dashboard',
  name: 'AdminDashboard',
  component: AdminDashboard,
  meta: { 
    requiresAuth: true,
    requiresAdmin: true 
  }
},
{
  path: '/admin/users',
  name: 'ManageUsers',
  component: ManageUsers,
  meta: { requiresAuth: true, requiresAdmin: true }
},
  {
    path: '/admin/reviews',
    name: 'AdminUserReview',
    component: AdminUserReviewView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: AdminAnalyticsView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },
];
const router = createRouter({
  history: createWebHistory(''),
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/register', '/forgot-password'];
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
