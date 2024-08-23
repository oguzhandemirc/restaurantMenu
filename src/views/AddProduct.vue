<template>
  <div class="w-full p-4 space-y-4 lg:px-20 md:px-20 ">
    <h1 class="text-2xl font-bold mb-4 text-center">Ürünleri Yönet</h1>

    <!-- Yeni Ürün Ekleme Formu -->
    <form @submit.prevent="addProduct" class="space-y-4 shadow-md lg:px-10 md:px-10 lg:py-10 md:py-10">
      <select v-model="newProductCategory" class="w-full p-2 border rounded" required>
        <option value="" disabled selected>Kategori Seç</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <input
        v-model="newProductName"
        type="text"
        placeholder="Ürün Adı"
        class="w-full p-2 border rounded"
        required
      />
      <input
        v-model.number="newProductPrice"
        type="number"
        placeholder="Ürün Fiyatı"
        class="w-full p-2 border rounded"
        required
      />
      <textarea
        v-model="newProductDescription"
        placeholder="Ürün Açıklaması"
        class="w-full p-2 border rounded"
        required
      ></textarea>
      <input type="file" @change="onFileChange" class="w-full p-2 border rounded" />
      <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded">Ürün Ekle</button>
      <pre>Ürün fotoğrafı en fazla 1 MB olabilir.</pre>
    </form>

    <h2 class="mt-8 text-xl font-semibold">Mevcut Ürünler</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div
        v-for="(product, index) in products"
        :key="product.id"
        :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
        class="border p-4 space-y-2 rounded-lg shadow-md"
      >
        <div class="flex items-center justify-between">
          <h3>{{ product.name }}</h3>
          <button @click="deleteProduct(product.id)" class="text-red-500">Sil</button>
        </div>
        <img 
          :src="product.imageUrl || defaultImageUrl" 
          alt="Product Image" 
          class="w-full h-40 object-cover rounded" 
        />
        <input
          v-model="product.name"
          type="text"
          class="w-full p-2 border rounded"
        />
        <input
          v-model.number="product.price"
          type="number"
          class="w-full p-2 border rounded"
        />
        <textarea
          v-model="product.description"
          class="w-full p-2 border rounded"
        ></textarea>
        <select v-model="product.category" class="w-full p-2 border rounded">
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <input type="file" @change="onUpdateFileChange($event, product)" class="w-full p-2 border rounded" />
        <button @click="updateProduct(product)" class="w-full p-2 bg-green-500 text-white rounded">Güncelle</button>
        <button v-if="product.imageUrl" @click="removeProductImage(product)" class="w-full p-2 bg-yellow-500 text-white rounded">Resmi Kaldır</button>
      </div>
    </div>

    <!-- Bildirim Mesajı -->
    <div v-if="message" class="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import defaultImage from '@/assets/white.png'; // Varsayılan resim için import
import { db, storage } from '@/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { defineComponent, onMounted, ref } from 'vue';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  newImage?: File;
}

export default defineComponent({
  setup() {
    const categories = ref<{ id: string; name: string }[]>([]);
    const products = ref<Product[]>([]);
    const newProductName = ref('');
    const newProductPrice = ref<number | null>(null);
    const newProductDescription = ref('');
    const newProductCategory = ref('');
    const newProductImage = ref<File | null>(null);
    const message = ref<string | null>(null);
    const defaultImageUrl = defaultImage; // Varsayılan resim url'si

    // Ürünleri ve Kategorileri yükleme
    const loadProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        category: doc.data().category,
        imageUrl: doc.data().imageUrl || defaultImageUrl // Varsayılan resim kullan
      }));
    };

    const loadCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      categories.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
    };

    // Yeni ürün ekleme
    const addProduct = async () => {
      if (!newProductName.value || !newProductPrice.value || !newProductDescription.value || !newProductCategory.value) return;

      let imageUrl = defaultImageUrl;
      if (newProductImage.value) {
        if (newProductImage.value.size > 1048576) { // 1MB = 1048576 bytes
          message.value = 'Resim boyutu 1 MB\'den büyük olamaz.';
          return;
        }

        const imageRef = storageRef(storage, `products/${newProductImage.value.name}`);
        await uploadBytes(imageRef, newProductImage.value);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'products'), {
        name: newProductName.value,
        price: newProductPrice.value,
        description: newProductDescription.value,
        category: newProductCategory.value,
        imageUrl
      });

      newProductName.value = '';
      newProductPrice.value = null;
      newProductDescription.value = '';
      newProductCategory.value = '';
      newProductImage.value = null;
      message.value = 'Ürün başarıyla eklendi!';
      await loadProducts();
      hideMessageAfterDelay();
    };

    // Ürün güncelleme
    const updateProduct = async (product: Product) => {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category
      });

      if (product.newImage) {
        if (product.newImage.size > 1048576) { // 1MB = 1048576 bytes
          message.value = 'Resim boyutu 1 MB\'den büyük olamaz.';
          return;
        }

        const imageRef = storageRef(storage, `products/${product.newImage.name}`);
        await uploadBytes(imageRef, product.newImage);
        const imageUrl = await getDownloadURL(imageRef);
        await updateDoc(productRef, { imageUrl });
      }

      message.value = 'Ürün başarıyla güncellendi!';
      await loadProducts();
      hideMessageAfterDelay();
    };

    // Resim güncelleme
    const onUpdateFileChange = async (event: Event, product: Product) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        product.newImage = target.files[0];
      }
    };

    // Resmi kaldırma
    const removeProductImage = async (product: Product) => {
      if (product.imageUrl && product.imageUrl !== defaultImageUrl) {
        const imageRef = storageRef(storage, product.imageUrl);
        await deleteObject(imageRef);

        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, { imageUrl: defaultImageUrl });

        message.value = 'Ürün resmi kaldırıldı!';
        await loadProducts();
        hideMessageAfterDelay();
      }
    };

    // Ürün silme
    const deleteProduct = async (id: string) => {
      await deleteDoc(doc(db, 'products', id));
      message.value = 'Ürün başarıyla silindi!';
      await loadProducts();
      hideMessageAfterDelay();
    };

    // Dosya değişikliği
    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        if (target.files[0].size > 1048576) { // 1MB = 1048576 bytes
          message.value = 'Resim boyutu 1 MB\'den büyük olamaz.';
          return;
        }
        newProductImage.value = target.files[0];
      }
    };

    // Mesajı birkaç saniye sonra gizle
    const hideMessageAfterDelay = () => {
      setTimeout(() => {
        message.value = null;
      }, 3000); // 3 saniye sonra mesajı gizle
    };

    onMounted(() => {
      loadProducts();
      loadCategories();
    });

    return {
      categories,
      products,
      newProductName,
      newProductPrice,
      newProductDescription,
      newProductCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      onFileChange,
      onUpdateFileChange,
      removeProductImage,
      message,
      defaultImageUrl,
    };
  }
});
</script>

<style scoped>

</style>
