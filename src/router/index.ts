import { auth } from '@/firebase';
import AddCategories from '@/views/AddCategories.vue';
import AddItems from '@/views/AddItems.vue';
import AddProduct from '@/views/AddProduct.vue';
import CategoryProducts from '@/views/CategoryProducts.vue';
import HomeView from '@/views/HomeView.vue';
import ItemsView from '@/views/ItemsView.vue';
import LoginView from '@/views/LoginView.vue';
// import RegisterView from '@/views/RegisterView.vue';
import { onAuthStateChanged } from 'firebase/auth';
import type { NavigationGuardNext, RouteRecordRaw } from 'vue-router'; // Tipler type-only olarak import edildi
import { createRouter, createWebHistory } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: HomeView },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: (to, from, next: NavigationGuardNext) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next(HomeView);
        } else {
          next();
        }
      });
    }
  },
  {
    path: '/addproduct',
    name: 'AddProduct',
    component: AddProduct,
    beforeEnter: (to, from, next: NavigationGuardNext) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next( );
        } else {
          next('/');
        }
      });
    }
  },
  {
    path: '/addcategories',
    name: 'AddCategories',
    component: AddCategories,
    beforeEnter: (to, from, next: NavigationGuardNext) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next();
        } else {
          next('/login');
        }
      });
    },
  },
  {
    path: '/additems',
    name: 'AddItems',
    component: AddItems,
    beforeEnter: (to, from, next: NavigationGuardNext) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next();
        } else {
          next('/login');
        }
      });
    },
  },
  {
    path: '/itemsview',
    name: 'ItemsView',
    component: ItemsView,
    beforeEnter: (to, from, next: NavigationGuardNext) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next();
        } else {
          next('/login');
        }
      });
    },
  },
  { 
    path: '/category/:id',
     name: 'CategoryProducts', 
     component: CategoryProducts 
    }, 
  // { 
  //   path: '/registerview',
  //    name: 'RegisterView', 
  //    component:RegisterView 
  //   }, 

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
