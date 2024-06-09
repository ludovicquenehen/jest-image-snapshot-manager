<template>
  <div class="fixed md:top-[30vh] md:left-5 bottom-0 left-0 md:w-fit w-full z-10">
    <div
      v-if="useUserStore.user"
      class="flex md:flex-col md:gap-2 gap-4 border-2 border-current rounded-lg pt-4 md:bg-transparent bg-white z-10 md:justify-start justify-center"
    >
      <div v-for="item in items" class="w-16 h-16 flex justify-center" @click="item.action()">
        <i :class="typeof item.iconClass === 'function' ? item.iconClass() : item.iconClass" />
      </div>
    </div>
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user-store'
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>
