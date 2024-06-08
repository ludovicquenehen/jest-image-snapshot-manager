<template>
  <div class="mt-4">
		<div v-for="item in items" class="w-16 h-16 flex justify-center" @click="item.action()">
    <i :class="typeof item.iconClass === 'function' ? item.iconClass() : item.iconClass" />
  </div>
	</div>
</template>
<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>
