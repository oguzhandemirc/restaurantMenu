<template>
  <nav class="navbar bg-yellow-600">
    <ul class="flex justify-between items-center text-lg h-10 font-poppins  text-center ">
      <li>
        <div class="w-full h-10 flex justify-center  items-center ">
          <router-link to="/" class=" font-medium">
            ZONE KAFE
          </router-link></div>
      </li>
      <li v-if="!currentUser"><router-link to="/">Menü</router-link></li>
      <li v-if="currentUser"><router-link to="/">Menü</router-link></li>
      <!-- <li v-if="!currentUser"><router-link to="/login">Giriş Yap</router-link></li> -->
      <li v-if="currentUser"><router-link to="/addcategories">Kategori Ekle</router-link></li>
      <!-- <li v-if="currentUser"><router-link to="/additems">Ürün Ekle</router-link></li> -->
      <li v-if="currentUser"><router-link to="/addproduct">Ürün Ekle</router-link></li>
      <!-- <li v-if="currentUser"><router-link to="/itemsview">items</router-link></li> -->
      <li v-if="currentUser"><button @click="logout">Çıkış Yap</button></li>
    
    
      
      
    </ul>
  </nav>
</template>

<script lang="ts">
import { auth, currentUser } from '@/firebase';
import { signOut } from "firebase/auth";
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    currentUser() {
      return currentUser.value;
    }
  },
  methods: {
    async logout() {
      await signOut(auth);
      this.currentUser = null;
    }
  }
});
</script>




<style scoped>
.navbar {
  padding: 10px;
  color: white;
}

.navbar ul {
  list-style: none;
  display: flex;
  gap: 10px;
}

.navbar li {
  display: inline;
}

.navbar a {
  color: white;
  text-decoration: none;
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
