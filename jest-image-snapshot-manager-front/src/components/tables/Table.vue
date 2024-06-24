<template>
  <div>
    <div
      v-if="!hideColumns"
      :class="['md:flex hidden gap-4 p-4 pr-8', { 'border-b-2 border-current': !hideBorders }]"
    >
      <template v-if="!hideColumns">
        <span v-for="column in computedColumns" :class="column.class">{{ column.label }}</span>
      </template>
    </div>
    <div class="flex flex-col gap-1">
			<div v-if="rows.length === 0 && !hideBorders && !hideColumns" class="text-white p-4 border-b-2 border-current">No records</div>
      <div
        v-for="(row, index) in typeof rows === 'function' ? rows(...parentRows) : rows"
        :class="[
          { 'text-white p-2 border-b-2 border-current': !hideBorders },
          typeof rowClass === 'function' ? rowClass(row, ...parentRows) : rowClass
        ]"
        @click="rowClick ? rowClick(row, ...parentRows) : () => {}"
      >
        <div class="flex md:flex-row flex-col gap-4 items-center">
          <span
            v-for="column in computedColumns"
            :class="
              column.rowClass
                ? typeof column.rowClass === 'function'
                  ? column.rowClass(row)
                  : column.rowClass
                : column.class
            "
            class="md:inline flex justify-between sm-full"
          >
            <span class="md:hidden inline">{{ column.label }}</span>
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
                  :class="[column.command.class, 'sm-full']"
                  @click="column.command.action(row)"
                >
                  <i :class="column.command.iconClass" />
                </button>
              </template>
              <template v-else-if="column.list">
                <Table
                  :parentRows="[row, ...(parentRows || [])]"
                  :rows="
                    typeof column.list.rows === 'function'
                      ? column.list.rows(row)
                      : column.list.rows
                  "
                  :rowClass="column.list.rowClass"
                  v-bind="column.list"
                />
              </template>
              <template v-else-if="column.src">
                <img :src="column.src(row)" />
              </template>
              <template v-else-if="column.component">
                <component
                  :is="column.component.is"
                  v-model="row[column.component.model]"
                  v-bind="{
                    ...column.component,
                    row
                  }"
                  @click="handleClick(row, column.component)"
                />
              </template>
              <template v-else>{{ row }}</template>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Table from '@/components/tables/Table.vue'
const props = defineProps({
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
  },
  hideColumns: {
    type: Boolean
  },
  hideBorders: {
    type: Boolean
  }
})

const emit = defineEmits(['select', 'click'])
const deepGet = (obj, keys) => keys.reduce((xs, x) => xs?.[x] ?? null, obj)
const handleObject = (fld) => {
  const t = Object.entries(fld).reduce((acc, [k, v]) => {
    if (typeof v === 'function') {
      acc[k] = (...evt) => {
        return v(...evt, ...props.parentRows)
      }
    } else if (typeof v === 'object' && !Array.isArray(v) && !v.component) {
      acc[k] = handleObject(v)
    } else {
      acc[k] = v
    }
    return acc
  }, {})

  return t
}

const handleClick = (row, component) => {
  if (!(typeof component.disabled === 'function' ? component.disabled(row) : component.disabled)) {
    component.action(row)
    emit('click', row)
  }
}

const computedColumns = computed(() => handleObject(props.columns))
</script>
