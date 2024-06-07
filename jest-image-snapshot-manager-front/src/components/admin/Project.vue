<template>
  <div class="w-fit">
    <div class="text-xl text-white mb-8">Projects</div>
    <div class="flex gap-2 mt-4">
      <input v-model="form.label" placeholder="Label" />
      <input v-model="form.path" placeholder="Project path" />
			<input v-model="form.pathTests" placeholder="Tests path" />
      <button
        :disabled="Object.values(form).some((e) => e === '')"
        class="button-green w-16"
        @click="useProjectStore.add(form)"
      >
        <i class="mdi mdi-plus" />
      </button>
    </div>

    <div class="flex gap-4 p-4 pr-8 border-b-2 border-current">
      <span class="w-8">ID</span>
      <span class="w-64">Label</span>
      <span class="w-64 text-center">Path</span>
			<span class="w-64 text-center">Path tests</span>
      <span>Version archive</span>
    </div>
    <div v-for="project in projects" class="text-white p-4 border-b-2 border-current">
      <div class="flex gap-4 items-center">
        <span class="w-8">{{ project.id }}</span>
        <span class="w-64">{{ project.label }}</span>
        <span class="w-64 text-center font-semibold">{{ project.path }}</span>
				<span class="w-64 text-center font-semibold">{{ project.pathTests }}</span>
        <span class="w-48">
          <div
            v-for="version in [
              ...new Set(
                useSnapshotStore.fullSnapshots
                  .filter((e) => e.projectId === project.id)
                  .map((e) => e.version)
              )
            ]"
            class="flex justify-between items-center mb-1"
          >
            <span>{{
              useSnapshotStore.fullSnapshots.find(
                (e) => e.projectId === project.id && e.version === version
              ).version
            }}</span>
            <div class="flex gap-2">
              <button
                v-if="
                  !useSnapshotStore.fullSnapshots.find(
                    (e) => e.projectId === project.id && e.version === version
                  ).archived
                "
                class="button-red w-32"
                @click="archive(project.id, version)"
              >
                <i class="mdi mdi-archive-arrow-down-outline" />
              </button>
              <template v-else>
                <button class="button-warning w-32" @click="unarchive(project.id, version)">
                  <i class="mdi mdi-archive-arrow-up-outline" />
                </button>
                <!-- <button class="button-red w-16" @click="useProjectStore.remove(project.id)">
                  <i class="mdi mdi-delete-outline" />
                </button> -->
              </template>
            </div>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project'
import useSnapshotStore from '@/stores/use-snapshot'

const projects = computed(() =>
  useProjectStore.projects.sort((a, b) => a.label.localeCompare(b.label))
)
const form = ref({
  label: '',
  path: '',
  pathTest: ''
})

const archive = async (projectId, versionId) => {
  await useProjectStore.archive(projectId, versionId)
  await useSnapshotStore.fetch(true)
}

const unarchive = async (projectId, versionId) => {
  await useProjectStore.unarchive(projectId, versionId)
  useSnapshotStore.fetch(true)
}
</script>
