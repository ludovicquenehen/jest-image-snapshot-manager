<template>
  <div class="w-fit">
    <button class="button-white mb-4 w-32" @click="router.push('/')">
      <i class="mr-2 mdi mdi-arrow-left" />
    </button>
    <div class="text-xl text-white mb-8">Users</div>
    <div class="flex gap-2 mt-4">
      <input v-model="form.new" placeholder="New password" type="password" />
      <input v-model="form.newRepeat" placeholder="Repeat password" type="password" />
      <button
        :disabled="Object.values(form).some((e) => e === '') || form.new !== form.newRepeat"
        class="button-green w-16"
        @click="changePassword"
      >
			<i class="mdi mdi-update" />
      </button>
    </div>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/use-user'

const router = useRouter()
const form = ref({
  new: '',
  newRepeat: ''
})
const changePassword = async () => {
  await useUserStore.changePassword(form.value)
  router.push('/login')
}
</script>

<style></style>
