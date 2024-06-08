<template>
  <div v-if="useUserStore.user" class="flex items-center fixed right-10 gap-2">
    <template v-for="item in items">
      <button
        v-if="!item.admin || useUserStore.isAdmin"
        :class="[
          'w-10 flex justify-center items-center rounded-full',
          {
            'button-white': item.color === 'white',
            'button-warning': item.color === 'warning',
            'button-green': item.color === 'green',
            'button-red': item.color === 'red',
            'button-action': item.color === 'action'
          }
        ]"
        @click="item.action()"
      >
        <i :class="typeof item.iconClass === 'function' ? item.iconClass() : item.iconClass" />
      </button>
    </template>
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>
