<template>
  <div class="flex">
    <div class="w-fit">
      <button class="button-white mb-2 w-32" @click="router.go(-1)">
        <i class="mr-2 mdi mdi-arrow-left" />
      </button>
      <div class="flex items-center gap-2">
        <button
          :disabled="!previous"
          class="paginate"
          @click="router.push(`/history/${previous}${route.hash}`)"
        >
          <i class="mdi mdi-chevron-left" />
        </button>
        <span class="mx-4 text-white">{{ current + 1 }} / {{ truths.length }}</span>
        <button
          :disabled="!next"
          class="paginate"
          @click="router.push(`/history/${next}${route.hash}`)"
        >
          <i class="mdi mdi-chevron-right" />
        </button>
        <div class="flex items-end gap-2">
          <span :class="['checkbox', { selected: showFullHistory }]" @click="toggleShowTruth">
            <i v-if="showFullHistory" class="mdi mdi-check" />
          </span>
          <span>Navigate on this history</span>
        </div>
      </div>
      <div class="flex">
        <div class="flex flex-col text-white gap-1 my-6">
          <span><span class="font-medium">Project:</span> {{ history[0]?.projectLabel }}</span>
          <span><span class="font-medium">Snapshot:</span> {{ history[0]?.label }}</span>
        </div>
        <div class="flex gap-8 mx-16 items-center">
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
    <div class="mt-44 ml-8">
      <img
        :src="`${proxyApi}${useSnapshotStore.snapshots.find((e) => e.id === +route.params.id)?.fullSrc}`"
        :class="[
          'w-[600px] h-auto',
          {
            'cursor-pointer': !useSnapshotStore.snapshots.find((e) => e.id === +route.params.id)
              .archived,
            'cursor-not-allowed': useSnapshotStore.snapshots.find((e) => e.id === +route.params.id)
              .archived
          }
        ]"
        @click="goToSnapshot(useSnapshotStore.snapshots.find((e) => e.id === +route.params.id))"
      />
    </div>
  </div>
</template>
<script setup>
import useSnapshotStore from '@/stores/use-snapshot'
import useProjectStore from '@/stores/use-project'
import useUserStore from '@/stores/use-user'
import { proxyApi } from '@/plugins/axios'
import Table from '@/components/Table.vue'

const router = useRouter()
const route = useRoute()

const showFullHistory = ref(false)
const toggleShowTruth = () => {
  showFullHistory.value = !showFullHistory.value
  const current = useSnapshotStore.snapshots.find((e) => e.id === +route.params.id)
  const truth = useSnapshotStore.snapshots.find((e) => !!e.truth && e.label === current.label)
  router.push(
    `/history/${showFullHistory.value ? current.id : truth.id}${showFullHistory.value ? '#full' : ''}`
  )
}

onMounted(() => {
  showFullHistory.value = route.hash === '#full'
})

onUpdated(() => {
  showFullHistory.value = route.hash === '#full'
})

const full = computed(() => route.hash === '#full' || showFullHistory.value)
const truths = computed(() => {
  const current = useSnapshotStore.snapshots.find((e) => e.id === +route.params.id)
  return useSnapshotStore.snapshots.filter((e) =>
    full.value ? e.label === current.label : !!e.truth
  )
})
const current = computed(() => truths.value.findIndex((e) => e.id === +route.params.id))
const previous = computed(() => truths.value[current.value - 1]?.id)
const next = computed(() => truths.value[current.value + 1]?.id)
const history = computed(() => {
  const current = useSnapshotStore.snapshots.find(
    (e) => e.id === +route.params.id && (full.value || !!e.truth)
  )
  return useSnapshotStore.snapshots
    .filter((e) => e.label === current?.label)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((e) => ({
      ...e,
      projectLabel: useProjectStore.projects.find((p) => p.id === e.projectId)?.label
    }))
})

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
  router.push('/')
}

const rowClass = (row) => [
  'text-white p-4',
  {
    'bg-blue': row.id === +route.params.id,
    'bg-green': !!row.truth,
    'bg-blue-green': row.id === +route.params.id && !!row.truth
  }
]

const rowClick = (row) => {
  goToLine(row.id)
}

const columns = ref([
  {
    label: 'ID',
    class: 'w-8',
    field: 'id'
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
    class: 'w-64',
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
  },
  {
    label: 'Snapshot',
    class: 'w-8 h-8',
    type: 'img',
    src: (row) => `${proxyApi}${row.fullSrc}`
  }
])
</script>
