<template>
  <div class="flex justify-center mt-[10%]">
    <div class="flex flex-col gap-2 w-1/6">
      <input v-model="form.email" type="text" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Password" />
      <button
        :disabled="Object.values(form).some((e) => e === '')"
        @click="login"
        class="button-white"
      >
        <i class="mdi mdi-login" />
      </button>
      <div class="flex gap-4">
        <RouterLink to="/sign-in" class="link text-xs"> Sign in </RouterLink>
        <RouterLink to="/forgot-password" class="link text-xs">
          Forgot password
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import useProjectStore from '@/stores/use-project'
import useUserStore from '@/stores/use-user'
import useSnapshotStore from '@/stores/use-snapshot'

const router = useRouter()

const form = ref({
  email: null,
  password: null
})

const login = async () => {
  await useUserStore.login(form.value)
  await useProjectStore.fetch(true)
  await useSnapshotStore.fetch(true)
  router.push('/')
}
</script>
