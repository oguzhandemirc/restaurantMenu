<template>
  <div>
    <div class="categories grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 w-full px-2 py-2 ">
      
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card w-full lg:max-h-40   flex justify-center items-center "
      >
        <router-link
          :to="{ name: 'CategoryProducts', params: { id: category.id }}"
          class="category-link w-full h-full flex items-center justify-center"
        >
          <img 
            v-if="category.imageUrl"
            :src="category.imageUrl"
            alt="Category Image"
            class="w-full h-full object-cover"
          />
          <h3 v-if="!category.imageUrl">{{ category.name }}</h3>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const categories = ref<{ id: string; name: string; imageUrl?: string }[]>([]);

    const loadCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        categories.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          imageUrl: doc.data().imageUrl || ''
        }));
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', (error as Error).message);
      }
    };

    onMounted(() => {
      loadCategories();
    });

    return {
      categories,
    };
  }
});
</script>

<style scoped>
/* Stil buraya eklenebilir */
</style>
