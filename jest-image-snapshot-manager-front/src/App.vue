<template>
  <div v-if="!useAppStore.loading">
    <Toolbar :items="toolbarItems" />
    <Navbar :items="navbarItems" />
    <div class="md:pl-24 mb-[15%] overflow-y-visible">
      <RouterView />
    </div>
    <a
      href="https://github.com/ludovicquenehen/jest-image-snapshot-manager"
      class="fixed bottom-1 right-1 text-white text-xs"
      >jest-image-snapshot-manager v{{ version }}</a
    >
  </div>
  <span v-else class="loader"> </span>
</template>
<script setup>
import { version } from '@/../package.json'
import { RouterView } from 'vue-router'
import useAppStore from '@/stores/use-app-store'
import useProjectStore from '@/stores/use-project-store'
import useUserStore from '@/stores/use-user-store'
import useSnapshotStore from '@/stores/use-snapshot-store'
import Navbar from '@/components/app/Navbar.vue'
import Toolbar from '@/components/app/Toolbar.vue'

const router = useRouter()
const route = useRoute()

const logout = async () => {
  await useUserStore.logout()
  router.push('/login')
}

const truths = computed(() => useSnapshotStore.snapshots.filter((e) => !!e.truth))

const navbarItems = computed(() => [
  {
    iconClass: () => [
      'mdi mdi-view-dashboard text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
      { 'text-cyan-600': route.path === '/' }
    ],
    action: () => router.push('/')
  },
  {
    iconClass: () => [
      'mdi mdi-git text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
      { 'text-cyan-600': route.path === '/flow' }
    ],
    action: () => router.push('/flow')
  },
  {
    iconClass: () => [
      'mdi mdi-monitor-screenshot text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
      { 'text-cyan-600': route.path === '/snapshots' }
    ],
    action: () => router.push('/snapshots')
  },
  {
    iconClass: () => [
      'mdi mdi-history text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
      { 'text-cyan-600': route.path.startsWith('/history') && !route.hash }
    ],
    action: () => router.push(`/history/${truths.value[0]?.id}`)
  }
])

const toolbarItems = ref([
  {
    admin: true,
    iconClass: 'mdi mdi-shield-crown-outline',
    color: 'warning',
    action: () => router.push('/admin')
  },
  {
    iconClass: 'mdi mdi-account',
    color: 'action',
    action: () => router.push('/user')
  },
  {
    iconClass: 'mdi mdi-logout',
    color: 'red',
    action: logout
  }
])

onMounted(async () => {
  setTimeout(async () => {
    if (!['/login', '/sign-in', '/confirm-account', '/forgot-password'].includes(route.path)) {
      useAppStore.loading = true
      await useUserStore.me()
      await useProjectStore.fetch(true)
      await useSnapshotStore.fetch(true)
      await useUserStore.fetch(true)
    }
    setTimeout(() => {
      useAppStore.loading = false
    }, 1000)
  }, 10)
})
</script>
