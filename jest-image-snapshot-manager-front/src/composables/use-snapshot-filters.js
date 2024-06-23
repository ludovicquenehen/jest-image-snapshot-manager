import useProjectStore from '@/stores/use-project-store'
import useSnapshotStore from '@/stores/use-snapshot-store'
import useUserStore from '@/stores/use-user-store'

const STATUS = ['REQUEST', 'APPROVE', 'DECLINE', 'MERGE', 'CLOSE']

export default function useSnapshotFilters(snapshots) {
  const model = ref(0)
  const preferences = computed(() => useUserStore.getPreferences())
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
      snapshots
        .filter((e) => e.projectId === filters.value.project && !e.archived)
        .map((e) => e.version)
    )
  ])

  const versionIterationList = computed(() => [
    ...new Set(
      snapshots
        .filter((e) => e.projectId === filters.value.project && e.version === filters.value.version)
        .map((e) => e.versionIteration)
    )
  ])

  const computedSnapshots = computed(() => {
    const { project, version, versionIteration } = filters.value
    return snapshots.filter(
      (e) =>
        project === e.projectId && version === e.version && versionIteration === e.versionIteration
    )
  })

  const computedRequestCount = computed(
    () => computedSnapshots.value.filter((e) => e.status === 'REQUEST').length
  )
  const computedPendingCount = computed(
    () => computedSnapshots.value.filter((e) => ['APPROVE', 'DECLINE'].includes(e.status)).length
  )
  const computedMergedCount = computed(
    () => computedSnapshots.value.filter((e) => e.status === 'MERGE').length
  )
  const computedClosedCount = computed(
    () => computedSnapshots.value.filter((e) => e.status === 'CLOSE').length
  )

  const setFiltersStatus = (statusAlias) => {
    const status = (statusAlias === 'PENDING' ? ['APPROVE', 'DECLINE'] : [statusAlias]).filter(
      Boolean
    )
		filters.value.status.push(...status)

    // Unset empty filters
    STATUS.forEach((e) => {
      const index = filters.value.status.findIndex((s) => s === e)
      if (index >= 0) {
        if (e === 'REQUEST' && computedRequestCount.value === 0) {
          filters.value.status.splice(index, 1)
        }
        if (e === 'APPROVE' && computedPendingCount.value === 0) {
          filters.value.status.splice(index, 1)
        }
        if (e === 'DECLINE' && computedPendingCount.value === 0) {
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

  const handleFiltersChange = async () => {
    refreshFilters()
    useUserStore.setPreferences({ ...filters.value, currentSnapshot: model.value })
  }

  const refreshFilters = async () => {
    if (!filters.value.version || !versionList.value.includes(filters.value.version)) {
      filters.value.version = versionList.value[versionList.value.length - 1]
    }

    if (
      !filters.value.versionIteration ||
      !versionIterationList.value.includes(filters.value.versionIteration)
    ) {
      filters.value.versionIteration =
        versionIterationList.value[versionIterationList.value.length - 1]
    }
  }

  onMounted(() => {
    versionIterationList.value = [...new Set(snapshots.map((e) => e.versionIteration))]
    filters.value.project = projectList.value[0]?.id
    refreshFilters()
    if (preferences.value) {
      filters.value = preferences.value
      model.value =
        preferences.currentSnapshot < computedSnapshots.value.length
          ? preferences.currentSnapshot
          : 0
    }
  })

  return {
    model,
    snapshots,
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
  }
}
