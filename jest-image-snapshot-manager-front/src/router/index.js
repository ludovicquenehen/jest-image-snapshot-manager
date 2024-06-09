import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import SignIn from '@/views/auth/SignIn.vue'
import ConfirmAccount from '@/views/auth/ConfirmAccount.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import Snapshots from '@/views/Snapshots.vue'
import Home from '@/views/Home.vue'
import SnapshotCarousel from '@/views/SnapshotCarousel.vue'
import Admin from '@/views/admin/Admin.vue'
import AdminUser from '@/views/admin/User.vue'
import AdminProject from '@/views/admin/Project.vue'
import AdminRunner from '@/views/admin/Runner.vue'
import User from '@/views/User.vue'
import History from '@/views/History.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignIn
    },
    {
      path: '/confirm-account',
      name: 'confirm-account',
      component: ConfirmAccount
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/flow',
      name: 'flow',
      component: SnapshotCarousel
    },
    {
      path: '/snapshots',
      name: 'snapshots',
      component: Snapshots
    },
    {
      path: '/user',
      name: 'user',
      component: User
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      children: [
        {
          path: 'user',
          component: AdminUser
        },
        {
          path: 'project',
          component: AdminProject
        },
        {
          path: 'runner',
          component: AdminRunner
        }
      ]
    },
    { path: '/history/:id', component: History }
  ]
})

export default router
