<script setup lang="ts">
import { RouterView } from 'vue-router';
import navbarLogged from './components/navbar-logged.vue';
</script>

<template>
  <header>
    
    <div class="wrapper">
      <nav>
        <navbarLogged />
      </nav>

    </div>
  </header>
  <RouterView />
</template>

<style scoped>

</style>
