<template>
  <div class="w-full p-4 space-y-4 lg:px-20 md:px-20 ">
    <h1 class="text-2xl font-bold mb-4 text-center">Kategorileri Yönet</h1>

    <!-- Yeni Kategori Ekleme Formu -->
    <form @submit.prevent="addCategory" class="space-y-4 shadow-md lg:px-10 md:px-10 lg:py-10 md:py-10">
      <input
        v-model="newCategoryName"
        type="text"
        placeholder="Kategori Adı"
        class="w-full p-2 border rounded"
        required
      />
      <input type="file" @change="onFileChange" class="w-full p-2 border rounded" />
      <p v-if="isFileTooLarge" class="text-red-500">Dosya boyutu 1MB'dan büyük olamaz!</p>
      <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded" :disabled="isFileTooLarge">Kategori Ekle</button>
    </form>

    <!-- Bildirim Mesajı -->
    <transition name="fade">
      <p v-if="notification" class="text-green-500">{{ notification }}</p>
    </transition>

    <h2 class="mt-8 text-xl font-semibold">Mevcut Kategoriler</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
        class="border p-4 space-y-2 rounded-lg shadow-md"
      >
        <div class="flex items-center justify-between">
          <h3>{{ category.name }}</h3>
          <button @click="deleteCategory(category.id)" class="text-red-500">Sil</button>
        </div>
        <img v-if="category.imageUrl" :src="category.imageUrl" alt="Category Image" class="w-full h-40 object-cover rounded" />
        <input
          v-model="category.name"
          type="text"
          class="w-full p-2 border rounded"
        />
        <input type="file" @change="onUpdateFileChange($event, category)" class="w-full p-2 border rounded" />
        <button @click="updateCategory(category)" class="w-full p-2 bg-green-500 text-white rounded">Güncelle</button>
        <button v-if="category.imageUrl" @click="removeCategoryImage(category)" class="w-full p-2 bg-yellow-500 text-white rounded">Resmi Kaldır</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { db, storage } from '@/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { defineComponent, onMounted, ref } from 'vue';

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  newImage?: File;
}

export default defineComponent({
  setup() {
    const MAX_FILE_SIZE_MB = 1; // Maksimum dosya boyutu 1MB
    const categories = ref<Category[]>([]);
    const newCategoryName = ref('');
    const newCategoryImage = ref<File | null>(null);
    const isFileTooLarge = ref(false);
    const notification = ref<string | null>(null);

    // Kategorileri yükleme
    const loadCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      categories.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl || ''
      }));
    };

    // Yeni kategori ekleme
    const addCategory = async () => {
      if (!newCategoryName.value) return;

      let imageUrl = '';
      if (newCategoryImage.value) {
        const imageRef = storageRef(storage, `categories/${newCategoryImage.value.name}`);
        await uploadBytes(imageRef, newCategoryImage.value);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.value,
        imageUrl
      });

      newCategoryName.value = '';
      newCategoryImage.value = null;
      isFileTooLarge.value = false;
      await loadCategories();

      // Bildirim göster
      showNotification('Kategori başarıyla eklendi!');
    };

    // Bildirim gösterme
    const showNotification = (message: string) => {
      notification.value = message;
      setTimeout(() => {
        notification.value = null;
      }, 3000); // Bildirim 3 saniye sonra kaybolur
    };

    // Kategori güncelleme
    const updateCategory = async (category: Category) => {
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, { name: category.name });

      if (category.newImage) {
        const imageRef = storageRef(storage, `categories/${category.newImage.name}`);
        await uploadBytes(imageRef, category.newImage);
        const imageUrl = await getDownloadURL(imageRef);
        await updateDoc(categoryRef, { imageUrl });
      }
      
      await loadCategories();

      // Bildirim göster
      showNotification('Kategori başarıyla güncellendi!');
    };

    // Resim güncelleme
    const onUpdateFileChange = (event: Event, category: Category) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const fileSizeMB = file.size / (1024 * 1024); // Dosya boyutu MB cinsinden hesaplanır
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          isFileTooLarge.value = true;
          category.newImage = null || undefined; // Dosya büyükse seçilen dosyayı iptal et
        } else {
          isFileTooLarge.value = false;
          category.newImage = file;
        }
      }
    };

    // Resmi kaldırma
    const removeCategoryImage = async (category: Category) => {
      if (category.imageUrl) {
        const imageRef = storageRef(storage, category.imageUrl);
        await deleteObject(imageRef);

        const categoryRef = doc(db, 'categories', category.id);
        await updateDoc(categoryRef, { imageUrl: '' });

        await loadCategories();

        // Bildirim göster
        showNotification('Kategori resmi kaldırıldı.');
      }
    };

    // Kategori silme
    const deleteCategory = async (id: string) => {
      await deleteDoc(doc(db, 'categories', id));
      await loadCategories();

      // Bildirim göster
      showNotification('Kategori başarıyla silindi.');
    };

    // Dosya değişikliği
    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const fileSizeMB = file.size / (1024 * 1024); // Dosya boyutu MB cinsinden hesaplanır
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          isFileTooLarge.value = true;
          newCategoryImage.value = null; // Dosya büyükse seçilen dosyayı iptal et
        } else {
          isFileTooLarge.value = false;
          newCategoryImage.value = file;
        }
      }
    };

    onMounted(() => {
      loadCategories();
    });

    return {
      categories,
      newCategoryName,
      newCategoryImage,
      isFileTooLarge,
      notification,
      addCategory,
      updateCategory,
      deleteCategory,
      onFileChange,
      onUpdateFileChange,
      removeCategoryImage
    };
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
