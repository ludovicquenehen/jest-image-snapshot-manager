<template>
  <div v-if="!loading">
    <div v-if="useUserStore.user" class="flex items-center fixed right-10 gap-2">
      <button class="button-red w-32 flex justify-center items-center" @click="logout">
        <i class="mdi mdi-logout" />
      </button>
    </div>
    <div>
      <div
        v-if="useUserStore.user"
        class="flex flex-col fixed top-[25%] left-5 gap-2 border-2 border-current rounded-lg"
      >
        <div class="w-16 h-16 flex justify-center mt-4">
          <i
            :class="[
              'mdi mdi-home-outline text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
              { 'text-cyan-600': route.path === '/' }
            ]"
            @click="router.push('/')"
          />
        </div>
        <div class="w-16 h-16 flex justify-center">
          <i
            :class="[
              'mdi mdi-monitor-screenshot text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
              {
                'text-cyan-600':
                  route.path === '/snapshots' || (route.path.startsWith('/history') && route.hash)
              }
            ]"
            @click="router.push('/snapshots')"
          />
        </div>
        <div class="w-16 h-16 flex justify-center">
          <i
            :class="[
              'mdi mdi-history text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
              { 'text-cyan-600': route.path.startsWith('/history') && !route.hash }
            ]"
            @click="router.push(`/history/${truths[0]?.id}`)"
          />
        </div>
        <div class="w-16 h-16 flex justify-center">
          <i
            :class="[
              'mdi mdi-account-outline text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
              { 'text-cyan-600': route.path === '/user' }
            ]"
            @click="router.push('/user')"
          />
        </div>
        <div v-if="useUserStore.isAdmin" class="w-16 h-16 flex justify-center">
          <i
            :class="[
              'mdi mdi-shield-crown-outline text-4xl cursor-pointer hover:text-cyan-600 hover:text-5xl',
              { 'text-cyan-600': route.path.startsWith('/admin') }
            ]"
            @click="router.push('/admin')"
          />
        </div>
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
import { name, version } from '@/../package.json'
import { RouterView } from 'vue-router'
import useProjectStore from '@/stores/use-project'
import useUserStore from '@/stores/use-user'
import useSnapshotStore from '@/stores/use-snapshot'

const router = useRouter()
const route = useRoute()

const logout = async () => {
  await useUserStore.logout()
  router.push('/login')
}

const truths = computed(() => useSnapshotStore.snapshots.filter((e) => !!e.truth))

const loading = ref(true)
onMounted(async () => {
  setTimeout(async () => {
    if (!['/login', '/forgot-password'].includes(route.path)) {
      await useUserStore.me()
      await useProjectStore.fetch(true)
      await useSnapshotStore.fetch(true)
      await useUserStore.fetch(true)
    }
    loading.value = false
  }, 10)
})
</script>