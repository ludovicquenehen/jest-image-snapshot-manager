<template>
  <div class="w-full">
    <div class="flex gap-16 mb-8">
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
      </div>
      <div v-if="computedSnapshots.length > 0" class="flex gap-4 text-xs text-white">
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
    <div v-if="filteredSnapshots.length > 0">
      <span class="text-white">{{ current?.label }}</span>
      <div class="flex justify-between my-4 h-8">
        <div class="flex">
          <div class="flex justify-between items-center gap-2">
            <div>
              <button :disabled="!previous" class="paginate" @click="navigate(-1)">
                <i class="mdi mdi-chevron-left" />
              </button>
              <span class="mx-4 text-white">{{ model + 1 }} / {{ filteredSnapshots.length }}</span>
              <button :disabled="!next" class="paginate" @click="navigate(1)">
                <i class="mdi mdi-chevron-right" />
              </button>
            </div>
            <div>
              <button @click="vertical = !vertical" class="button-action mr-2 w-16">
                <i class="mdi mdi-rotate-right-variant" />
              </button>
              <button :disabled="!received" class="button-action w-16" @click="toggleDiff">
                <i class="mdi mdi-vector-difference" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <div v-if="current">
            <button
              class="button-white mr-2 w-16"
              @click="router.push(`/history/${received ? received.id : current.id}#full`)"
            >
              <i class="mdi mdi-history" />
            </button>
            <template v-if="canApprove">
              <button class="button-green w-36 mr-2" @click="approve">Approuver</button>
              <button class="button-red w-36" @click="decline">Décliner</button>
            </template>
            <template v-else>
              <button
                disabled
                :class="[
                  'mr-2 w-36',
                  {
                    'button-green': (received ? received : current)?.status === 'MERGE',
                    'button-warning': ['APPROVE', 'DECLINE'].includes(
                      (received ? received : current)?.status
                    ),
                    'button-red': (received ? received : current)?.status === 'CLOSE'
                  }
                ]"
              >
                {{ (received ? received : current)?.status }}D
              </button>
              <button
                v-if="
                  isAdmin && !['MERGE', 'CLOSE'].includes((received ? received : current)?.status)
                "
                class="button-green w-36"
                @click="merge"
              >
                MERGE
              </button>
            </template>
          </div>
        </div>
      </div>
      <div :class="['flex item-center gap-4 w-full', { 'flex-col': vertical }]">
        <img :src="`${proxyApi}${current?.fullSrc}`" class="snapshot-image" />

        <div v-if="received">
          <img
            class="absolute hover:cursor-pointer snapshot-image"
            @click="toggleDiff"
            :src="`${proxyApi}${received?.fullSrc}`"
          />
          <img
            v-if="showDiff"
            class="absolute mix-blend-multiply hover:cursor-pointer snapshot-image"
            @click="toggleDiff"
            :src="`${proxyApi}${received?.fullSrcDiff}`"
          />
        </div>
        <img v-else :src="`${proxyApi}${current?.fullSrc}`" class="snapshot-image opacity-10" />
      </div>
    </div>
  </div>
  <span v-if="filteredSnapshots.length === 0" class="text-2xl ml-8 mt-[15%]">Aucun snapshot</span>
</template>
<script setup>
import { api, proxyApi } from '@/plugins/axios'
import useUserStore from '@/stores/use-user'
import useSnapshotStore from '@/stores/use-snapshot'
import useKeyboard from '@/composables/use-keyboard'
import useSnapshotFilters from '@/composables/use-snapshot-filters'

const router = useRouter()
const isAdmin = computed(() => useUserStore.user?.role === 'ADMIN')

const vertical = ref(false)
const snapshotImageWidth = computed(() =>
  vertical.value ? `${window.innerWidth}px` : `${window.innerWidth / 2 - 120}px`
)

/** Snapshots & filters */
const {
  model,
  filters,
  projectList,
  versionList,
  versionIterationList,
  computedSnapshots,
  computedRequestCount,
  computedPendingCount,
  computedMergedCount,
  computedClosedCount,
  filteredSnapshots,
  refresh,
  setFiltersStatus,
  handleFiltersChange
} = useSnapshotFilters(useSnapshotStore.snapshots)
/** */

/** Current & navigation */
const current = computed(() => {
  const snapshot = filteredSnapshots.value[model.value] || filteredSnapshots.value[0]
  return snapshot?.truthId ? useSnapshotStore.snapshots.find((e) => e.id === snapshot.truthId) : snapshot
})

const received = computed(() => {
  const { version, versionIteration } = filters.value
  const received = filteredSnapshots.value.find(
    (e) =>
      e.label === current.value?.label &&
      e.truthId &&
      version === e.version &&
      versionIteration === e.versionIteration
  )

  return received
})

const canApprove = computed(() => received.value?.status === 'REQUEST')
const previous = computed(() => model.value > 0)
const next = computed(() => model.value < filteredSnapshots.value.length - 1)

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

/** Diff */
const showDiff = ref(true)
const toggleDiff = () => (showDiff.value = !showDiff.value)
/** */

/** Flows */
const approve = async () => {
  await api.post(`/snapshot/${received.value.id}/approve`, { truthId: current.value.id })
  await refresh()
  setFiltersStatus('PENDING')
}

const decline = async () => {
  await api.get(`/snapshot/${received.value.id}/decline`)
  await refresh()
  setFiltersStatus('PENDING')
}

const merge = async () => {
  await api.get(`/run/merge/${received.value.projectId}/${received.value.version}`)
  await refresh()
  setFiltersStatus('MERGE')
}
/** */
</script>

<style scoped>
.snapshot-image {
  height: auto;
  width: v-bind(snapshotImageWidth);
  max-width: 1024px;
}
</style>
