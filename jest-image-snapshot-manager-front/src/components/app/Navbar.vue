<template>
  <div
    :class="[
      'bg-current fixed bottom-0 left-0 md:w-fit w-full z-10 pr-4',
      { 'md:top-[10vh]': useUserStore.isAdmin, 'md:top-[30vh]': !useUserStore.isAdmin }
    ]"
  >
    <div
      v-if="useUserStore.user"
      class="flex md:flex-col md:gap-2 gap-4 border-2 border-current rounded-lg pt-4 md:bg-transparent bg-white z-10 md:justify-start justify-center"
    >
      <div
        v-for="item in items"
        :class="['flex justify-center', { 'w-16 h-16': !item.separator }]"
        @click="item.action()"
      >
        <div v-if="item.separator" class="separator border-b-2 border-current mb-6"></div>
        <i
          v-else
          :class="typeof item.iconClass === 'function' ? item.iconClass() : item.iconClass"
        />
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

<style scoped>
.separator {
  width: 70%;
}
</style>
