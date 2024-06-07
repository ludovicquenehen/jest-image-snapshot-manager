<template>
  <div>
    <button
      class="button-white mb-4 w-32"
      @click="router.push(route.path === '/admin' ? '/' : '/admin')"
    >
      <i class="mr-2 mdi mdi-arrow-left" />
    </button>
    <div class="flex">
      <div>
        <div class="flex gap-4 mb-8">
          <button class="text-lg w-32" @click="router.push('/admin/user')">Users</button>
          <button class="text-lg w-32" @click="router.push('/admin/project')">Project</button>
          <button class="text-lg w-32" @click="router.push('/admin/runner')">Runner</button>
        </div>
        <RouterView v-if="route.path !== '/admin'" />
        <div v-else>
          <div class="text-xl text-white">Admin</div>
          <div v-if="route.path !== '/admin'" class="flex gap-4 mt-8">
            <button class="text-lg w-32" @click="router.push('/admin/user')">Users</button>
            <button class="text-lg w-32" @click="router.push('/admin/project')">Project</button>
            <button class="text-lg w-32" @click="router.push('/admin/runner')">Runner</button>
          </div>
          <div class="flex flex-col gap-8 mt-8">
            <span class="flex text-lg text-white items-center"
              ><i class="mdi mdi-chevron-right text-2xl" />User management</span
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
  </div>
</template>
<script setup>
import { RouterView } from 'vue-router'
import useUserStore from '@/stores/use-user'
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
