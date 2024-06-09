<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
import useUserStore from '@/stores/use-user-store'

const router = useRouter()
const route = useRoute()
onMounted(async () => {
  await useUserStore.confirmAccount(route.hash.replace('#/v1/', ''))
  router.push('/login')
})
</script>
