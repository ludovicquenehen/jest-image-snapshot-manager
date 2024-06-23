<template>
	<RouterView />
</template>
<script setup>
import useUserStore from '@/stores/use-user-store';

const router = useRouter()
onMounted(() => {
	if (!useUserStore.isAdmin) {
		router.push('/')
	}
})
</script>