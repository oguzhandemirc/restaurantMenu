<template>
  <div  class="flex justify-start items-center font w-full h-16 bg-gray-100 pl-5">
    <h1 class="flex font-semibold text-2xl ">{{ categoryName }}</h1>
  </div>
    <div v-if="products.length" class="mt-2 w-full space-y-5 px-2">
      
    <div 
      v-for="(product, index) in products" 
      :key="product.id" 
      :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-100'" 
      class="w-full b-2 flex justify-between space-x-3 py-3 rounded-lg shadow"
    >
      <div class="w-4/12 justify-center items-start flex">
        <img class="rounded-2xl w-20 h-20" :src="product.imageUrl" alt="Product Image">
      </div>
      <div class="w-9/12">
        <div class="font-semibold text-lg">{{ product.name }}</div>
        <div class="font-thin text-sm italic">{{ product.description }}</div>
      </div>
      <div class="flex items-center justify-center text-lg w-3/12 text-red-600 font-semibold">{{ product.price }} TL</div>
    </div>
  </div>
  
  <p class="pl-5 pt-5" v-else>Bu kategoride henüz ürün yok.</p>

</template>

<script lang="ts">
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export default defineComponent({
  setup() {
    const route = useRoute();
    const categoryId = route.params.id as string;
    const categoryName = ref<string>('');
    const products = ref<Product[]>([]);

    const loadCategoryProducts = async () => {
      try {
        // Kategori adını al
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoryDoc = categoriesSnapshot.docs.find(doc => doc.id === categoryId);
        if (categoryDoc) {
          categoryName.value = categoryDoc.data().name;
        }

        // Kategoriye ait ürünleri getir
        const productsQuery = query(collection(db, 'products'), where('category', '==', categoryId));
        const productsSnapshot = await getDocs(productsQuery);
        products.value = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          description: doc.data().description,
          imageUrl: doc.data().imageUrl
        }));
      } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', (error as Error).message);
      }
    };

    onMounted(() => {
      loadCategoryProducts();
    });

    return {
      categoryName,
      products
    };
  }
});
</script>

<style scoped>

</style>
