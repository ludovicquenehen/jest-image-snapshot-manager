import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import SignIn from '@/views/auth/SignIn.vue'
import ConfirmAccount from '@/views/auth/ConfirmAccount.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import Snapshots from '@/views/Snapshots.vue'
import Home from '@/views/Home.vue'
import Flow from '@/views/Flow.vue'
import AdminUser from '@/views/admin/User.vue'
import AdminProject from '@/views/admin/Project.vue'
import AdminDevice from '@/views/admin/Device.vue'
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
      component: Flow
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
      children: [
        {
          path: 'user',
          component: AdminUser
        },
				{
          path: 'device',
          component: AdminDevice
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
