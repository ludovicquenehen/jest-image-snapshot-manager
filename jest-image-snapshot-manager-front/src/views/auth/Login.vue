<template>
  <div class="flex justify-center md:mt-[10%] mt-[50%]">
    <div class="flex flex-col gap-2 md:w-1/6 w-2/3">
      <input v-model="form.email" type="text" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Password" />
      <button
        :disabled="Object.values(form).some((e) => e === '')"
        @click="login"
        class="button-white"
      >
        <i class="mdi mdi-login" />
      </button>
      <div class="flex flex-col gap-2 mt-16">
        <button class="button-action text-xs" @click="router.push('/sign-in')">Sign in</button>
        <button class="button-action text-xs" @click="router.push('/forgot-password')">
          Reset password
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/use-user-store'

const router = useRouter()

const form = ref({
  email: null,
  password: null
})

const login = async () => {
  if (await useUserStore.login(form.value)) {
    router.push('/')
  }
}
</script>
