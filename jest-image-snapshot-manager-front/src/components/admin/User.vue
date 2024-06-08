<template>
  <div class="w-fit">
    <div class="text-xl text-white mb-8">Users</div>
    <div class="flex gap-2 mt-4">
      <input v-model="form.email" placeholder="Email" />
      <select v-model="form.role">
        <option disabled value="">Role</option>
        <option v-for="role in ['ADMIN', 'USER']" :value="role">{{ role }}</option>
      </select>
      <button
        :disabled="Object.values(form).some((e) => e === '')"
        class="button-green w-16"
        @click="useUserStore.add(form)"
      >
        <i class="mdi mdi-send" />
      </button>
    </div>

    <div class="flex gap-4 p-4 pr-8 border-b-2 border-current">
      <span class="w-8">ID</span>
      <span class="w-64">Email</span>
      <span class="w-32 text-center">Role</span>
      <span>Projects</span>
      <span class="w-32"></span>
    </div>
    <div v-for="user in users" class="text-white p-4 border-b-2 border-current">
      <div class="flex gap-4 items-center">
        <span class="w-8">{{ user.id }}</span>
        <span class="w-64">{{ user.email }}</span>
        <span
          :class="[
            'w-32 text-center font-semibold',
            { 'text-warning': user.role === 'ADMIN', 'text-blum': user.role === 'USER' }
          ]"
          >{{ user.role }}</span
        >
        <span>
          <div class="flex flex-col gap-1">
            <div
              v-for="project in useProjectStore.projects"
              class="flex justify-between items-center"
            >
              <span class="w-64">{{ project.label }}</span>
              <div class="flex gap-2">
                <button
                  :disabled="user.projects?.includes(project.id)"
                  class="button-green w-16"
                  @click="useUserStore.join(user.id, project.id)"
                >
								<i class="mdi mdi-location-enter" />
                </button>
                <button
                  :disabled="!user.projects?.includes(project.id)"
                  class="button-red w-16"
                  @click="useUserStore.leave(user.id, project.id)"
                >
								<i class="mdi mdi-location-exit" />
                </button>
              </div>
            </div>
          </div>
        </span>
        <span class="w-32 flex items-center">
          <button
            v-if="useUserStore.user.id !== user.id"
            :disabled="user.projects.length"
            class="button-red w-32"
            @click="useUserStore.remove(user.id)"
          >
            <i class="mdi mdi-delete-outline" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user'
import useProjectStore from '@/stores/use-project'

const users = computed(() =>
  useUserStore.users
    .filter((e) => e.role !== 'SYSTEM')
    .map((e) => ({ ...e, projects: e.projects.map((p) => p.id) }))
    .sort((a, b) => (a.id > b.id ? 1 : -1))
)

const form = ref({
  email: '',
  role: ''
})
</script>
