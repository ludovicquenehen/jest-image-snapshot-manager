<template>
  <div>
    <div class="text-xl text-white mb-8">Admin</div>
    <div class="flex">
      <div>
        <div class="flex gap-4 mb-8">
          <button
            :class="['text-lg w-32', { active: route.path === '/admin/user' }]"
            @click="router.push('/admin/user')"
          >
            Users
          </button>
          <button
            :class="['text-lg w-32', { active: route.path === '/admin/device' }]"
            @click="router.push('/admin/device')"
          >
            Devices
          </button>
          <button
            :class="['text-lg w-32', { active: route.path === '/admin/project' }]"
            @click="router.push('/admin/project')"
          >
            Projects
          </button>
          <button
            :class="['text-lg w-32', { active: route.path === '/admin/runner' }]"
            @click="router.push('/admin/runner')"
          >
            Runners
          </button>
        </div>
        <RouterView />
        <div v-if="route.path === '/admin'" class="flex flex-col gap-8 mt-8">
          <span class="flex text-lg text-white items-center"
            ><i class="mdi mdi-chevron-right text-2xl" />User management</span
          >
          <span class="flex text-lg text-white items-center"
            ><i class="mdi mdi-chevron-right text-2xl" />Devices management</span
          >
          <span class="flex text-lg text-white items-center"
            ><i class="mdi mdi-chevron-right text-2xl" />Project and user's project access
            management</span
          >
          <span class="flex text-lg text-white items-center"
            ><i class="mdi mdi-chevron-right text-2xl" />Runners (COMMIT, MERGE)</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { RouterView } from 'vue-router'
import useUserStore from '@/stores/use-user-store'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  if (useUserStore.user?.role !== 'ADMIN') {
    router.push('/')
  }
  await useUserStore.fetch(true)
})
</script>
<style></style>
