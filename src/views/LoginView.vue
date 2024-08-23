<template>
  <div class="flex w-full justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
      <form @submit.prevent="login" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="E-posta"
          autocomplete="email"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Şifre"
          autocomplete="current-password"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Giriş Yap
        </button>
      </form>
      <p v-if="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { auth } from '@/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const email = ref<string>('');
    const password = ref<string>('');
    const error = ref<string>('');
    const router = useRouter();

    const login = async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        console.log("Giriş başarılı:", userCredential.user);
        // Başarıyla giriş yaptıktan sonra anasayfaya yönlendirin ve sayfayı yenileyin
        await router.push('/');
        window.location.reload(); // Sayfayı yeniler, bu sayede auth durumu doğru şekilde alınır
      } catch (err: any) {
        console.error("Giriş hatası:", err.message);
        error.value = "Giriş başarısız: " + err.message;
      }
    };

    return {
      email,
      password,
      error,
      login,
    };
  },
});
</script>

<style scoped>
/* Responsive ve modern stil */
body {
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .min-h-screen {
    height: 100vh;
  }
}
</style>
