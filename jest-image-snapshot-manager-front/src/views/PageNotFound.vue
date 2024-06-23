<template>
  <div class="flex flex-col text-center gap-8 mt-28">
    <i class="mdi mdi-emoticon-dead-outline text-9xl text-red-500" />
		<span class="text-9xl text-bold">404</span>
    <span class="text-5xl text-bold">Page not found !</span>
    <button class="button-white w-48 mx-auto" @click="router.push('/')">Return to home</button>
  </div>
</template>

<script setup>
const router = useRouter()
</script>

<style></style>
