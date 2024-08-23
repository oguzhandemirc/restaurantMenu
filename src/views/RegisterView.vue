<template>
    <div class="register-container">
      <h1>Kayıt Ol</h1>
      <form @submit.prevent="register">
        <div>
          <label for="email">E-posta:</label>
          <input v-model="email" type="email" id="email" required />
        </div>
        <div>
          <label for="password">Şifre:</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <div>
          <label for="confirmPassword">Şifre Tekrar:</label>
          <input v-model="confirmPassword" type="password" id="confirmPassword" required />
        </div>
        <button type="submit">Kayıt Ol</button>
      </form>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script lang="ts">
  import { auth } from '@/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { defineComponent } from 'vue';
  
  export default defineComponent({
    data() {
      return {
        email: '',
        password: '',
        confirmPassword: '',
        error: ''
      };
    },
    methods: {
      async register() {
        this.error = '';
  
        if (this.password !== this.confirmPassword) {
          this.error = 'Şifreler uyuşmuyor.';
          return;
        }
  
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          console.log("Kayıt başarılı:", userCredential.user);
          // Kayıt başarılı olduğunda yapılacak işlemler
        } catch (error: any) {
          console.error("Kayıt hatası:", error.message);
          this.error = "Kayıt başarısız: " + error.message;
        }
      }
    }
  });
  </script>
  
  <style scoped>
  .register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  p {
    color: red;
    margin-top: 10px;
  }
  </style>
  