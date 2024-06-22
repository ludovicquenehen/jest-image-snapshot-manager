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
          <button :disabled="!previous" class="paginate" @click="navigate(-1)">
            <i class="mdi mdi-chevron-left" />
          </button>
          <span class="mx-4 text-white">{{ model + 1 }} / {{ filteredSnapshots.length }}</span>
          <button :disabled="!next" class="paginate" @click="navigate(1)">
            <i class="mdi mdi-chevron-right" />
          </button>
        </div>
      </div>
      <div v-if="computedSnapshots.length > 0" class="flex md:gap-4 gap-2 text-xs text-white">
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
      <div class="flex item-center gap-4 w-full">
        <div>
          <div class="flex items-center mb-4">
            <div>
              <Cursor
                v-model="cursor"
                min="0"
                :max="cursorMax"
                :disabled="!received"
                :width="snapshotImageWidth"
              />
            </div>
            <div v-if="current" class="flex gap-2 ml-32">
              <button :disabled="!received" class="button-action w-16" @click="toggleDiff">
                <i class="mdi mdi-vector-difference" />
              </button>
              <button
                class="button-white w-16"
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
									v-if="(received ? received : current)?.status !== 'REQUEST'"
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
									:disabled="(received ? received : current)?.status === 'MERGE'"
                  class="button-green w-36"
                  @click="merge"
                >
                  MERGE
                </button>
              </template>
            </div>
          </div>
          <div v-if="received">
            <img
							ref="snapshotImage"
              class="absolute hover:cursor-pointer snapshot-image"
              @click="toggleDiff"
              :src="`${proxyApi}${current?.fullSrc}`"
            />
            <div class="absolute crop-container">
              <img
                class="snapshot-image"
                @click="toggleDiff"
                :src="`${proxyApi}${received?.fullSrc}`"
              />
            </div>
            <div class="absolute crop-container">
              <img
                v-if="showDiff"
                class="mix-blend-multiply snapshot-image"
                @click="toggleDiff"
                :src="`${proxyApi}${received?.fullSrcDiff}`"
              />
            </div>
          </div>
          <img v-else ref="snapshotImage" :src="`${proxyApi}${current?.fullSrc}`" class="snapshot-image" />
        </div>
      </div>
    </div>
  </div>
  <span v-if="filteredSnapshots.length === 0" class="text-2xl ml-8 mt-[15%]">Aucun snapshot</span>
</template>
<script setup>
import { api, proxyApi } from '@/plugins/axios'
import useUserStore from '@/stores/use-user-store'
import useSnapshotStore from '@/stores/use-snapshot-store'
import useKeyboard from '@/composables/use-keyboard'
import useSnapshotFilters from '@/composables/use-snapshot-filters'
import Cursor from '@/components/inputs/Cursor.vue'

const router = useRouter()
const isAdmin = computed(() => useUserStore.user?.role === 'ADMIN')

/** Image dimension & Cursor */
const snapshotImageWidth = computed(() => `${window.innerWidth / 2}px`)
const snapshotImage = ref(null)
const cursor = ref(0)
const cursorMax = computed(() => snapshotImage.value?.getBoundingClientRect().width || 0)
const computedCursor = computed(() => `${cursor.value}px`)
const computedCursorBorder = computed(() =>
  cursor.value > 0 && cursor.value < cursorMax.value ? '2px' : '0px'
)
/** */

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
  return snapshot?.truthId
    ? useSnapshotStore.snapshots.find((e) => e.id === snapshot.truthId)
    : snapshot
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

//TODO: move in store
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
@media screen and (min-width: 992px) {
  .snapshot-image {
    height: auto;
    width: v-bind(snapshotImageWidth);
		max-width: v-bind(snapshotImageWidth);
  }
}

@media screen and (max-width: 992px) {
  .snapshot-image {
    height: auto;
    width: 80vw;
    max-width: 80vw;
  }
}

.crop-container {
  width: v-bind(computedCursor);
  overflow: hidden;
  border-right: v-bind(computedCursorBorder) solid red;
}
</style>
