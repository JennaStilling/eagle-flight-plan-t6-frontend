<template>

    <div class="modified-width">
      <p>Professor home page</p>
      <p> Current role: {{ homeStore.getCurrentRole }}</p>
      <p> Current home page: {{ homeStore.getHomePage }}</p>
    </div>
  </template>
  
  <script setup>
  import { useHomePageStore } from '@/store/homePageStore';
  import { onMounted } from 'vue';
  
  const homeStore = useHomePageStore();
  
  </script>
  
  <style scoped>
  .modified-width {
    height: 100vh;
    margin: 0 auto;
    padding-top: 15px;
  }
  </style>
