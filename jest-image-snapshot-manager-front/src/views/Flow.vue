<template>
  <div class="w-full">
    <div class="flex md:flex-row flex-col md:gap-16 gap-2 mb-4">
      <div class="flex gap-2">
        <select v-model="filters.project" @change="handleFiltersChange">
          <option disabled value="">Project</option>
          <option v-for="project in projectList" :value="project.id">{{ project.label }}</option>
        </select>
        <select v-model="filters.version" @change="handleFiltersChange">
          <option disabled value="">Version</option>
          <option v-for="version in versionList" :value="version">{{ version }}</option>
        </select>
        <select v-model="filters.versionIteration" @change="handleFiltersChange">
          <option disabled value="">Iteration</option>
          <option v-for="versionIteration in versionIterationList" :value="versionIteration">
            {{ versionIteration }}
          </option>
        </select>
        <div class="md:inline md:w-48 w-36">
          <template v-if="computedSnapshots.length > 0">
            <button :disabled="!previous" class="paginate" @click="navigate(-1)">
              <i class="mdi mdi-chevron-left" />
            </button>
            <span class="mx-4 text-white"
              >{{ model + 1 }} / {{ Object.keys(groupedSnapshots).length }}</span
            >
            <button :disabled="!next" class="paginate" @click="navigate(1)">
              <i class="mdi mdi-chevron-right" />
            </button>
          </template>
        </div>
      </div>
      <div class="flex md:gap-4 gap-2 text-xs text-white">
        <div
          :class="[
            'tag tag-white',
            { disabled: !computedRequestCount, selected: filters.status.includes('REQUEST') }
          ]"
          @click="setFiltersStatus('REQUEST')"
        >
          <span class="mr-2">REQUEST</span>
          <span>
            {{ computedRequestCount }}
          </span>
        </div>
        <div
          :class="[
            'tag tag-warning',
            {
              disabled: !computedPendingCount,
              selected: ['APPROVE', 'DECLINE'].some((e) => filters.status.includes(e))
            }
          ]"
          @click="setFiltersStatus('PENDING')"
        >
          <span class="mr-2">PENDING</span>
          <span>
            {{ computedPendingCount }}
          </span>
        </div>
        <div
          :class="[
            'tag tag-green',
            { disabled: !computedMergedCount, selected: filters.status.includes('MERGE') }
          ]"
          @click="setFiltersStatus('MERGE')"
        >
          <span class="mr-2">MERGED</span>
          <span>
            {{ computedMergedCount }}
          </span>
        </div>
        <div
          :class="[
            'tag tag-red',
            { disabled: !computedClosedCount, selected: filters.status.includes('CLOSE') }
          ]"
          @click="setFiltersStatus('CLOSE')"
        >
          <span class="mr-2">CLOSED</span>
          <span>
            {{ computedClosedCount }}
          </span>
        </div>
      </div>
    </div>
    <div v-for="(group, index) in Object.keys(groupedSnapshots)">
      <SnapshotCarousel
        v-if="model === index"
        :devices="groupedSnapshots[group]"
        @set-filters="setFilters"
      />
    </div>
  </div>
  <span v-if="computedSnapshots.length === 0" class="text-2xl ml-8 mt-[15%]">Aucun snapshot</span>
</template>
<script setup>
import useSnapshotStore from '@/stores/use-snapshot-store'
import useKeyboard from '@/composables/use-keyboard'
import useSnapshotFilters from '@/composables/use-snapshot-filters'
import SnapshotCarousel from '@/components/SnapshotCarousel.vue'

/** Snapshots & filters */
const model = ref(0)
const {
  filters,
  projectList,
  versionList,
  versionIterationList,
  computedSnapshots,
  computedRequestCount,
  computedPendingCount,
  computedMergedCount,
  computedClosedCount,
  setFiltersStatus,
  handleFiltersChange
} = useSnapshotFilters(useSnapshotStore.snapshots)

const setFilters = async (status) => {
  setFiltersStatus(status)
}

const groupedSnapshots = computed(() =>
  computedSnapshots.value
    .filter((e) => filters.value.status.includes(e.status))
    .reduce((acc, e) => {
      if (!acc[e.label]) {
        acc[e.label] = {}
      }
      acc[e.label][e.device] = {
        ...e,
        current: e.srcDiff && useSnapshotStore.snapshots.find((s) => s.id === e.truthId)
      }
      return acc
    }, {})
)

/** */

/** Current & navigation */
const previous = computed(() => model.value > 0)
const next = computed(() => model.value < Object.keys(groupedSnapshots.value).length - 1)

const navigate = (orientation) => {
  if (orientation > 0) {
    model.value = model.value + 1
  }

  if (orientation < 0) {
    model.value = model.value - 1
  }
}

useKeyboard({ left: () => navigate(-1), right: () => navigate(1) })
/** */
</script>
