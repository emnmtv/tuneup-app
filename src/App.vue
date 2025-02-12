<script setup>
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";

const route = useRoute();
</script>

<template>
 <NavBar v-if="!['/', '/register'].includes(route.path)" />

  <router-view></router-view>
</template>
