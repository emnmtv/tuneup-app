<template>
  <div class="sidenav">
    <router-link to="/dashboard">Dashboard</router-link>
    <router-link to="/profile">Profile</router-link>
    <router-link to="/settings">Settings</router-link>
    <router-link to="/upgrade">Upgrade</router-link>
    <router-link to="/creatorprofile">Creator Profile</router-link>
    <router-link to="/createpost">Create Post</router-link>
    <router-link to="/creatorpost">Creator Post</router-link>

    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/");
    },
  },
};
</script>

<style>
.sidenav {
  width: 250px;
  height: 100vh;
  background: #333;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.sidenav a {
  color: white;
  text-decoration: none;
  padding: 10px 0;
}
.sidenav a:hover {
  background: #555;
}
button {
  margin-top: 20px;
  padding: 10px;
  border: none;
  background: red;
  color: white;
  cursor: pointer;
}
</style>
