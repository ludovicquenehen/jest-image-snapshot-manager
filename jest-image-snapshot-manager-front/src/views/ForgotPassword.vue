<template>
  <div class="flex justify-center mt-[10%]">
    <div class="flex flex-col gap-2 w-1/6">
      <input v-model="email" placeholder="Email" />
      <button :disbled="!email" class="button-white" @click="resetPassword"><i class="mdi mdi-lock-reset" /></button>
    </div>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/use-user'

const router = useRouter()
const email = ref('')
const resetPassword = async () => {
	await useUserStore.resetPassword(email.value)
	router.push('/login')
}
</script>

<style></style>
