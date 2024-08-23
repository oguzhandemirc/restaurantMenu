<template>
  <div>
    <div v-for="category in categorizedProducts" :key="category.id" class="category-section">
      <h2>{{ category.name }}</h2>
      <div class="products">
        <div v-for="product in category.products" :key="product.id" class="product-card">
          <img :src="product.imageUrl" alt="Product Image" />
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <p>Fiyat: {{ product.price }}₺</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { defineComponent, onMounted, ref } from 'vue';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

export default defineComponent({
  setup() {
    const categorizedProducts = ref<Category[]>([]);

    const loadProductsByCategory = async () => {
      try {
        // Kategorileri çek
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categories: Category[] = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          products: [] // Bu kategorinin ürünlerini burada depolayacağız
        }));

        // Ürünleri çek ve ilgili kategorilere ekle
        const productsSnapshot = await getDocs(collection(db, 'products'));
        productsSnapshot.docs.forEach(doc => {
          const product = {
            id: doc.id,
            ...doc.data()
          } as Product;

          const category = categories.find(cat => cat.id === product.category);
          if (category) {
            category.products.push(product);
          }
        });

        // Kategorilere göre gruplandırılmış ürünleri ayarla
        categorizedProducts.value = categories;
      } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', (error as Error).message);
      }
    };

    onMounted(() => {
      loadProductsByCategory();
    });

    return {
      categorizedProducts
    };
  }
});
</script>

<style scoped>
.category-section {
  margin-bottom: 20px;
}

.products {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.product-card {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  width: 200px;
  text-align: center;
}

.product-card img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.product-card h3 {
  margin-bottom: 5px;
}

.product-card p {
  margin: 5px 0;
}
</style>
