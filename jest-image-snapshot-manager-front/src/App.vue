<template>
  <div v-if="!useAppStore.loading">
    <Toolbar :items="toolbarItems" />
    <Navbar v-if="hasSnapshots" :items="navbarItems" />
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
import useDeviceStore from '@/stores/use-device-store'
import Navbar from '@/components/app/Navbar.vue'
import Toolbar from '@/components/app/Toolbar.vue'

const router = useRouter()
const route = useRoute()

const logout = async () => {
  await useUserStore.logout()
  router.push('/login')
}

const truths = computed(() => useSnapshotStore.snapshots.filter((e) => !!e.truth))
const hasSnapshots = computed(() => useSnapshotStore.snapshots?.length > 0)

const navbarItems = computed(() =>
  [
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
        { 'text-cyan-600': route.path.startsWith('/history') }
      ],
      action: () => router.push(`/history/${truths.value[0]?.id}`)
    },
    { separator: true },
    useUserStore.isAdmin && {
      iconClass: () => [
        'mdi mdi-shield-account text-4xl cursor-pointer hover:text-orange-500 hover:text-5xl',
        { 'text-orange-500': route.path.startsWith('/admin/user') }
      ],
      action: () => router.push('/admin/user')
    },
    useUserStore.isAdmin && {
      iconClass: () => [
        'mdi mdi-cellphone-link text-4xl cursor-pointer hover:text-orange-500 hover:text-5xl',
        { 'text-orange-500': route.path.startsWith('/admin/device') }
      ],
      action: () => router.push('/admin/device')
    },
    useUserStore.isAdmin && {
      iconClass: () => [
        'mdi mdi-sitemap-outline text-4xl cursor-pointer hover:text-orange-500 hover:text-5xl',
        { 'text-orange-500': route.path.startsWith('/admin/project') }
      ],
      action: () => router.push('/admin/project')
    },
    useUserStore.isAdmin && {
      iconClass: () => [
        'mdi mdi-test-tube text-4xl cursor-pointer hover:text-orange-500 hover:text-5xl',
        { 'text-orange-500': route.path.startsWith('/admin/runner') }
      ],
      action: () => router.push('/admin/runner')
    }
  ].filter(Boolean)
)

const toolbarItems = ref([
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
      await useDeviceStore.fetch(true)
    }
    setTimeout(() => {
      useAppStore.loading = false
    }, 1000)
  }, 10)
})
</script>
