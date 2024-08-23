<template>
    <div>
      <h1>Ürün Ekle</h1>
      <input v-model="title" placeholder="Ürün Başlığı" />
      <input v-model="price" type="number" placeholder="Ürün Fiyatı" />
      <textarea v-model="description" placeholder="Ürün Açıklaması"></textarea>
      <input type="file" @change="onFileChange" />
      <button @click="addItem">Ekle</button>
    </div>
  </template>
  
  <script lang="ts">
  import { db } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    setup() {
      const title = ref('');
      const price = ref(0);
      const description = ref('');
      const image = ref<File | null>(null);
  
      const onFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          image.value = target.files[0];
        }
      };
  
      const addItem = async () => {
        if (title.value.trim() !== '' && price.value > 0 && description.value.trim() !== '' && image.value) {
          const storage = getStorage();
          const storageReference = storageRef(storage, `images/${image.value.name}`);
          await uploadBytes(storageReference, image.value);
          const imageUrl = await getDownloadURL(storageReference);
  
          await addDoc(collection(db, 'items'), {
            title: title.value,
            price: price.value,
            description: description.value,
            imageUrl
          });
  
          // Reset form
          title.value = '';
          price.value = 0;
          description.value = '';
          image.value = null;
        }
      };
  
      return { title, price, description, onFileChange, addItem };
    }
  });
  </script>
  