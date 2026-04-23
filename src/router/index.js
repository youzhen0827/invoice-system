import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Invoices from '../views/Invoices.vue'
import Reports from '../views/Reports.vue'
import { cleanupModalBackdrop } from '../utils/modal.js'



const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首頁'
    }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: Invoices,
    meta: {
      title: '發票管理'
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: {
      title: '統計報表'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.afterEach(() => {
  cleanupModalBackdrop()
})

// 設定頁面標題
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 發票管理系統` : '發票管理系統'
  next()
})

export default router