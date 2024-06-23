<template>
  <div v-if="!signedIn" class="flex justify-center md:mt-[10%] mt-[50%]">
    <div class="flex flex-col gap-2 md:w-1/6 w-2/3">
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Password" />
      <input v-model="form.repeat" type="password" placeholder="Repeat" />
      <button
        :disabled="Object.values(form).some((e) => !e) || form.password !== form.repeat"
        class="button-white"
        @click="signIn"
      >
        <i class="mdi mdi-send" />
      </button>
    </div>
  </div>
  <div v-else class="flex flex-col text-center gap-8 mt-28">
    <i class="mdi mdi-check-circle text-9xl text-green-500" />
    <span class="text-5xl text-bold">Congrats !</span>
    <span class="text-2xl font-semibold">
      You should have received an email to confirm your account
    </span>
    <button class="button-white w-48 mx-auto" @click="router.push('/login')">
      Return to login page
    </button>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/use-user-store'

const router = useRouter()
const route = useRoute()
const signedIn = ref(false)
const form = ref({
  email: '',
  password: '',
  repeat: ''
})
const signIn = async () => {
	delete form.value.repeat
  await useUserStore.signIn({ ...form.value, organization: route.params.id})
  signedIn.value = true
}
</script>

<style></style>
