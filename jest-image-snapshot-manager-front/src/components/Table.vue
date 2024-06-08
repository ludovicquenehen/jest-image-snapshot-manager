<template>
  <div>
    <div v-if="!hideColumns" class="flex gap-4 p-4 pr-8 border-b-2 border-current">
      <span v-for="column in computedColumns" :class="column.class">{{ column.label }}</span>
    </div>
    <div
      v-for="(row, index) in rows"
      :class="[
        'text-white p-4',
        { 'border-b-2 border-current': !hideColumns },
        typeof rowClass === 'function' ? rowClass(row, ...parentRows) : rowClass
      ]"
      @click="rowClick(row, ...parentRows)"
    >
      <div class="flex gap-4 items-center">
        <span
          v-for="column in computedColumns"
          :class="
            column.rowClass
              ? typeof column.rowClass === 'function'
                ? column.rowClass(row)
                : column.rowClass
              : column.class
          "
        >
          <template
            v-if="!(typeof column.hidden === 'function' ? column.hidden(row) : column.hidden)"
          >
            <template v-if="typeof column.field === 'function'">
              {{ column.field(row) }}
            </template>
            <template v-else-if="column.field">
              {{ deepGet(row, [...column.field.split('.')]) }}
            </template>
            <template v-else-if="column.command">
              <button
                v-if="
                  !(typeof column.command.hidden === 'function'
                    ? column.command.hidden(row)
                    : column.command.hidden)
                "
                :disabled="
                  typeof column.command.disabled === 'function'
                    ? column.command.disabled(row)
                    : column.command.disabled
                "
                :class="column.command.class"
                @click="column.command.action(row)"
              >
                <i :class="column.command.iconClass" />
              </button>
            </template>
            <template v-else-if="column.list">
              <Table
                :parentRows="[row, ...(parentRows || [])]"
                :hideColumns="true"
                :columns="column.list.columns"
                :rows="
                  typeof column.list.rows === 'function' ? column.list.rows(row) : column.list.rows
                "
                :rowClass="column.list.rowClass"
              />
            </template>
            <template v-else-if="column.type === 'img'">
              <img :src="column.src(row)" />
            </template>
            <template v-else>{{ row }}</template>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import Table from '@/components/Table.vue'
const props = defineProps({
  hideColumns: {
    type: Boolean
  },
  columns: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Array,
    default: () => []
  },
  parentRows: {
    type: Array,
    default: () => []
  },
  rowClass: {
    type: String,
    default: ''
  },
  rowClick: {
    type: Function
  }
})
const emit = defineEmits(['select'])

const deepGet = (obj, keys) => keys.reduce((xs, x) => xs?.[x] ?? null, obj)
const handleObject = (fld) => {
  const t = Object.entries(fld).reduce((acc, [k, v]) => {
    if (typeof v === 'function') {
      acc[k] = (...evt) => {
        return v(...evt, ...props.parentRows)
      }
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      acc[k] = handleObject(v)
    } else {
      acc[k] = v
    }
    return acc
  }, {})

  return t
}

const computedColumns = computed(() => handleObject(props.columns))
</script>
