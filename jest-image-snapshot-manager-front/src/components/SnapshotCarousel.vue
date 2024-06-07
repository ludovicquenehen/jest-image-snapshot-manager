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
import useProjectStore from '@/stores/use-project'
import useSnapshotStore from '@/stores/use-snapshot'
import useUserStore from '@/stores/use-user'
import useKeyboard from '@/composables/use-keyboard'

const router = useRouter()

const STATUS = ['REQUEST', 'APPROVE', 'DECLINE', 'MERGE', 'CLOSE']

const isAdmin = computed(() => useUserStore.user?.role === 'ADMIN')

/** Snapshots & filters */
const snapshots = computed(() => useSnapshotStore.snapshots)
const filters = ref({
  project: null,
  version: null,
  versionIteration: null,
  status: ['REQUEST']
})

const projectList = computed(() =>
  useProjectStore.projects.filter((e) =>
    useUserStore.user?.projects?.map((p) => p.id).includes(e.id)
  )
)
const versionList = computed(() => [
  ...new Set(
    snapshots.value
      .filter((e) => e.projectId === filters.value.project && !e.archived)
      .map((e) => e.version)
  )
])
const versionIterationList = computed(() => [
  ...new Set(
    snapshots.value
      .filter((e) => e.projectId === filters.value.project && e.version === filters.value.version)
      .map((e) => e.versionIteration)
  )
])

const computedSnapshots = computed(() => {
  const { project, version, versionIteration } = filters.value
  const filtered = snapshots.value.filter(
    (e) =>
      project === e.projectId && version === e.version && versionIteration === e.versionIteration
  )

  return filtered
})

const computedRequestCount = computed(
  () => computedSnapshots.value.filter((e) => e.status === 'REQUEST').length
)
const computedApproveCount = computed(
  () => computedSnapshots.value.filter((e) => e.status === 'APPROVE').length
)
const computedDeclineCount = computed(
  () => computedSnapshots.value.filter((e) => e.status === 'DECLINE').length
)
const computedPendingCount = computed(() => computedApproveCount.value + computedDeclineCount.value)
const computedMergedCount = computed(
  () => computedSnapshots.value.filter((e) => e.status === 'MERGE').length
)
const computedClosedCount = computed(
  () => computedSnapshots.value.filter((e) => e.status === 'CLOSE').length
)

const filteredSnapshots = computed(() => {
  let filtered = computedSnapshots.value.filter((e) => filters.value.status.includes(e.status))
  const labels = []
  filtered = filtered.reduce((acc, obj) => {
    if (!labels.includes(obj.age)) {
      acc.push(obj)
    }
    return acc
  }, [])
  return filtered
})

const setFiltersStatus = (statusAlias) => {
  const status = (statusAlias === 'PENDING' ? ['APPROVE', 'DECLINE'] : [statusAlias]).filter(
    Boolean
  )
  status.forEach((e) => {
    const index = filters.value.status.findIndex((s) => s === e)
    if (index >= 0) {
      filters.value.status.splice(index, 1)
    } else {
      filters.value.status.push(e)
    }
  })

  // Unset empty filters
  STATUS.forEach((e) => {
    const index = filters.value.status.findIndex((s) => s === e)
    if (index >= 0) {
      if (e === 'REQUEST' && computedRequestCount.value === 0) {
        filters.value.status.splice(index, 1)
      }
      if (e === 'APPROVE' && computedApproveCount.value === 0) {
        filters.value.status.splice(index, 1)
      }
      if (e === 'DECLINE' && computedDeclineCount.value === 0) {
        filters.value.status.splice(index, 1)
      }
      if (e === 'MERGE' && computedMergedCount.value === 0) {
        filters.value.status.splice(index, 1)
      }
      if (e === 'CLOSE' && computedClosedCount.value === 0) {
        filters.value.status.splice(index, 1)
      }
    }
  })

  useUserStore.setPreferences({ ...filters.value, currentSnapshot: model.value })
}

const vertical = ref(false)

const refresh = async () => {
  await useSnapshotStore.fetch(true)
  versionIterationList.value = [...new Set(snapshots.value.map((e) => e.versionIteration))]
}

const handleFiltersChange = async () => {
  setFiltersStatus([])
  refreshFilters()
  useUserStore.setPreferences({ ...filters.value, currentSnapshot: model.value })
}

const refreshFilters = async () => {
  if (!filters.value.version || !versionList.value.includes(filters.value.version)) {
    filters.value.version = versionList.value[versionList.value.length - 1]
  }

  if (
    !filters.value.versionIteration ||
    !versionIterationList.value.includes(filters.value.version)
  ) {
    filters.value.versionIteration =
      versionIterationList.value[versionIterationList.value.length - 1]
  }
}

onMounted(() => {
  versionIterationList.value = [...new Set(snapshots.value.map((e) => e.versionIteration))]
  filters.value.project = projectList.value[0]?.id
  refreshFilters()
  const preferences = useUserStore.getPreferences()
  if (preferences) {
    filters.value = preferences
    model.value =
      preferences.currentSnapshot < filteredSnapshots.value.length ? preferences.currentSnapshot : 0
  }
})
/** */

/** Current & navigation */
const model = ref(0)
const current = computed(() => {
  const snapshot = filteredSnapshots.value[model.value] || filteredSnapshots.value[0]
  return snapshot?.truthId ? snapshots.value.find((e) => e.id === snapshot.truthId) : snapshot
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

const snapshotImageWidth = computed(() =>
  vertical.value ? `${window.innerWidth}px` : `${window.innerWidth / 2 - 120}px`
)
</script>

<style scoped>
.snapshot-image {
  height: auto;
  width: v-bind(snapshotImageWidth);
  max-width: 1024px;
}
</style>
