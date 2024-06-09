<template>
  <div v-if="!passwordReset" class="flex justify-center md:mt-[10%] mt-[50%]">
    <div class="flex flex-col gap-2 md:w-1/6 w-2/3">
      <input v-model="email" placeholder="Email" />
      <button :disbled="!email" class="button-white" @click="resetPassword">
        <i class="mdi mdi-lock-reset" />
      </button>
    </div>
  </div>
  <div v-else class="flex flex-col text-center gap-8 mt-28">
    <i class="mdi mdi-check-circle text-9xl text-green-500" />
    <span class="text-5xl text-bold">Congrats !</span>
    <span class="text-2xl font-semibold">
      You should have received an email with a new password
    </span>
    <button class="button-white w-48 mx-auto" @click="router.push('/login')">
      Return to login page
    </button>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/use-user-store'

const router = useRouter()
const passwordReset = ref(false)
const email = ref('')
const resetPassword = async () => {
  await useUserStore.resetPassword(email.value)
  passwordReset.value = true
}
</script>

<style></style>
