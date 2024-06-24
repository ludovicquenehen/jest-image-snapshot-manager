<template>
  <div class="flex">
    <div class="md:w-fit">
      <div class="text-xl text-white mb-8">History</div>
      <div class="flex items-center gap-2">
        <select v-model="device">
          <option disabled value="">Device</option>
          <option
            v-for="device in [{ label: 'Default', suffix: null }, ...useDeviceStore.devices]"
            :value="device.suffix"
          >
            {{ device.label }}
          </option>
        </select>
        <button
          :disabled="!previous"
          class="paginate"
          @click="router.push(`/history/${previous}${route.hash}`)"
        >
          <i class="mdi mdi-chevron-left" />
        </button>
        <span class="mx-2 text-white">{{ current + 1 }} / {{ truths.length }}</span>
        <button
          :disabled="!next"
          class="paginate"
          @click="router.push(`/history/${next}${route.hash}`)"
        >
          <i class="mdi mdi-chevron-right" />
        </button>
        <Checkbox :model-value="showFullHistory" @click="toggleShowTruth"
          >Navigate on this history</Checkbox
        >
      </div>
      <div class="flex justify-between">
        <div class="flex flex-col text-white gap-1 my-6">
          <span><span class="font-medium">Snapshot:</span> {{ history?.[0]?.label }}</span>
        </div>
        <div class="flex md:flex-row flex-col md:gap-8 gap-1 mx-16 md:items-center">
          <div class="flex items-center gap-2">
            <span class="flex bg-blue h-8 w-20 border-2 border-white"></span>
            <span class="text-white font-semibold">Current</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex bg-green h-8 w-20 border-2 border-white"></span>
            <span class="text-white font-semibold">Truth</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex bg-blue-green h-8 w-20 border-2 border-white"></span>
            <span class="text-white font-semibold">Both</span>
          </div>
        </div>
      </div>
      <Table :columns="columns" :rows="history" :rowClass="rowClass" :rowClick="rowClick" />
    </div>
    <div class="md:inline hidden mt-48 ml-8">
      <img
        :src="`${proxyApi}${useSnapshotStore.snapshots.find((e) => e.id === route.params.id)?.fullSrc}`"
        :class="[
          'w-[600px] h-auto',
          {
            'cursor-pointer': !useSnapshotStore.snapshots.find((e) => e.id === route.params.id)
              ?.archived,
            'cursor-not-allowed': useSnapshotStore.snapshots.find((e) => e.id === route.params.id)
              ?.archived
          }
        ]"
        @click="goToSnapshot(useSnapshotStore.snapshots.find((e) => e.id === route.params.id))"
      />
    </div>
  </div>
</template>
<script setup>
import useSnapshotStore from '@/stores/use-snapshot-store'
import useProjectStore from '@/stores/use-project-store'
import useUserStore from '@/stores/use-user-store'
import { proxyApi } from '@/plugins/axios'
import Table from '@/components/tables/Table.vue'
import Checkbox from '@/components/inputs/Checkbox.vue'
import useDeviceStore from '@/stores/use-device-store'

const router = useRouter()
const route = useRoute()

const setHistory = () => {
  const current = useSnapshotStore.snapshots.find(
    (e) => e.id === route.params.id && (full.value || !!e.truth)
  )
  history.value = useSnapshotStore.snapshots
    .filter((e) => e.label === current?.label && device.value === e.device)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((e) => ({
      ...e,
      projectLabel: useProjectStore.projects.find((p) => p.id === e.projectId)?.label
    }))
}

watch(
  () => route.path,
  () => {
    showFullHistory.value = route.hash === '#full'
    setHistory()
  }
)

const device = computed({
  get: () => useUserStore.getPreferences().device || null,
  set: (v) => {
    useUserStore.setPreferences({ device: v })
    setHistory()
  }
})

const showFullHistory = ref(false)
const toggleShowTruth = () => {
  showFullHistory.value = !showFullHistory.value
  const current = useSnapshotStore.snapshots.find((e) => e.id === route.params.id)
  const truth = useSnapshotStore.snapshots.find(
    (e) => !!e.truth && e.label === current.label && e.device === device.value
  )
  router.push(
    `/history/${showFullHistory.value ? current.id : truth.id}${showFullHistory.value ? '#full' : ''}`
  )
}

onMounted(() => {
  showFullHistory.value = route.hash === '#full'
  setHistory()
})

const full = computed(() => route.hash === '#full' || showFullHistory.value)
const truths = computed(() => {
  const current = useSnapshotStore.snapshots.find((e) => e.id === route.params.id)
  return useSnapshotStore.snapshots.filter(
    (e) => (full.value ? e.label === current.label : !!e.truth) && e.device === device.value
  )
})
const current = computed(() => truths.value.findIndex((e) => e.id === route.params.id))
const previous = computed(() => truths.value[current.value - 1]?.id)
const next = computed(() => truths.value[current.value + 1]?.id)
const history = ref()

const goToLine = (id) => {
  const current = useSnapshotStore.snapshots.find((e) => e.id === id)
  const truth = useSnapshotStore.snapshots.find((e) => !!e.truth && e.label === current.label)
  if (id !== truth.id) {
    router.push(`/history/${id}#full`)
  } else {
    router.push(`/history/${id}`)
  }
}

const goToSnapshot = (snapshot) => {
  if (snapshot.archived) {
    return
  }

  const filters = {
    project: snapshot.projectId,
    version: snapshot.version,
    versionIteration: snapshot.versionIteration,
    status: [snapshot.status]
  }
  const snapshots = useSnapshotStore.snapshots.filter(
    (e) =>
      filters.project === e.projectId &&
      filters.version === e.version &&
      filters.versionIteration === e.versionIteration
  )

  const labels = []
  const filteredSnapshots = snapshots
    .filter((e) => filters.status.includes(e.status))
    .reduce((acc, obj) => {
      if (!labels.includes(obj.age)) {
        acc.push(obj)
      }
      return acc
    }, [])

  const currentIndex = filteredSnapshots.findIndex((e) => e.id === snapshot.id)

  useUserStore.setPreferences({
    ...filters,
    currentSnapshot: currentIndex
  })
  router.push('/flow')
}

const rowClass = (row) => [
  '-mb-1 h-14 flex',
  {
    'bg-blue': row.id === route.params.id,
    'bg-green': !!row.truth,
    'bg-blue-green': row.id === route.params.id && !!row.truth
  }
]

const rowClick = (row) => {
  goToLine(row.id)
}

const columns = ref([
  {
    label: 'Projet',
    class: 'w-32',
    field: (row) => useProjectStore.projects.find((e) => e.id === row.projectId)?.label
  },
  {
    label: 'Version',
    class: 'w-16',
    field: 'version'
  },
  {
    label: 'Iteration',
    class: 'w-16',
    field: 'versionIteration'
  },
  {
    label: 'Status',
    class: 'w-32 text-center',
    rowClass: (row) => [
      'w-32 text-center font-medium',
      {
        'text-plum': row.status === 'REQUEST',
        'text-warning': ['APPROVE', 'DECLINE'].includes(row.status),
        'text-green': row.status === 'MERGE',
        'text-red': row.status === 'CLOSE'
      }
    ],
    field: (row) => (['APPROVE', 'DECLINE'].includes(row.status) ? 'PENDING' : row.status)
  },
  {
    label: 'Created at',
    class: 'w-64',
    field: 'createdAt'
  },
  {
    label: 'Validator',
    class: 'w-16',
    field: 'createdAt',
    field: (row) =>
      useUserStore.users.find((e) => e.id === row.validatorId)?.id === useUserStore.user?.id
        ? 'You'
        : useUserStore.users.find((e) => e.id === row.validatorId)?.role === 'SYSTEM'
          ? 'SYSTEM'
          : useUserStore.users.find((e) => e.id === row.validatorId)?.email
  },
  {
    class: 'w-32',
    rowClass: 'w-32 text-warning font-semibold',
    field: (row) => (row.archived ? 'ARCHIVED' : '')
  }
])
</script>
