<template>
  <div v-if="!loading">
    <Toolbar :items="toolbarItems" />
    <div>
      <div
        v-if="useUserStore.user"
        class="flex flex-col fixed top-[30%] left-5 gap-2 border-2 border-current rounded-lg"
      >
        <Navbar :items="navbarItems" />
      </div>
      <RouterView class="ml-24" />
      <a
        href="https://github.com/ludovicquenehen/jest-image-snapshot-manager"
        class="fixed bottom-1 right-1 text-white text-xs"
        >jest-image-snapshot-manager v{{ version }}</a
      >
    </div>
  </div>
</template>
<script setup>
import { version } from '@/../package.json'
import { RouterView } from 'vue-router'
import useProjectStore from '@/stores/use-project'
import useUserStore from '@/stores/use-user'
import useSnapshotStore from '@/stores/use-snapshot'
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
      'mdi mdi-home text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
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

const loading = ref(true)
onMounted(async () => {
  setTimeout(async () => {
    if (!['/login', '/sign-in', '/confirm-account', '/forgot-password'].includes(route.path)) {
      await useUserStore.me()
      await useProjectStore.fetch(true)
      await useSnapshotStore.fetch(true)
      await useUserStore.fetch(true)
    }
    loading.value = false
  }, 10)
})
</script>
