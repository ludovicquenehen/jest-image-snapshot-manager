<template>
  <div v-for="(device, index) in Object.keys(devices)">
    <template v-if="index === visible">
      <div class="flex justify-between">
        <div class="flex gap-4 mb-4 items-center">
          <button class="button-fill" :disabled="visible === 0" @click="visible--">
            <i class="mdi mdi-chevron-left" />
          </button>
          <span class="text-white"
            >{{ devices[device]?.label }} ({{
              device !== 'null' ? device : 'default'
            }}
            device)</span
          >
          <button
            class="button-fill"
            :disabled="visible >= Object.keys(devices).length - 1"
            @click="visible++"
          >
            <i class="mdi mdi-chevron-right" />
          </button>
        </div>
        <div class="flex items-center mb-4">
          <div class="flex gap-2 ml-32">
            <button
              :disabled="!devices[device].current"
              class="button-action w-16"
              @click="toggleDiff"
            >
              <i class="mdi mdi-vector-difference" />
            </button>
            <button
              class="button-white w-16"
              @click="
                router.push(
                  `/history/${devices[device].current ? devices[device].current.id : devices[device].id}#full`
                )
              "
            >
              <i class="mdi mdi-history" />
            </button>
            <template v-if="devices[device]?.status === 'REQUEST'">
              <button class="button-green w-36 mr-2" @click="approve(devices[device])">
                APPROVE
              </button>
              <button class="button-red w-36" @click="decline(devices[device])">DECLINE</button>
            </template>
            <template v-else>
              <button
                v-if="devices[device].status !== 'REQUEST'"
                disabled
                :class="[
                  'mr-2 w-36',
                  {
                    'button-green': devices[device]?.status === 'MERGE',
                    'button-warning': ['APPROVE', 'DECLINE'].includes(devices[device].status),
                    'button-red': devices[device]?.status === 'CLOSE'
                  }
                ]"
              >
                {{ devices[device].status }}D
              </button>
              <button
                v-if="isAdmin && !['MERGE', 'CLOSE'].includes(devices[device]?.status)"
                :disabled="devices[device].status === 'MERGE'"
                class="button-green w-36"
                @click="merge(devices[device])"
              >
                MERGE
              </button>
            </template>
          </div>
        </div>
      </div>
      <div class="flex flex-col item-center gap-4 w-full mt-2">
        <Cursor
          v-model="cursor"
          min="0"
          max="100"
          :disabled="!devices[device].current"
          :width="snapshotImageWidthPx"
        />
        <div class="flex w-full">
          <div v-if="devices[device].current">
            <img
              :id="`${devices[device].label}${device ? device : ''}`"
              class="absolute hover:cursor-pointer snapshot-image"
              @click="toggleDiff"
              :src="`${proxyApi}${devices[device]?.fullSrc}`"
            />
            <div class="absolute crop-container">
              <img
                class="snapshot-image"
                @click="toggleDiff"
                :src="`${proxyApi}${devices[device].current.fullSrc}`"
              />
            </div>
            <div class="absolute crop-container">
              <img
                v-if="showDiff"
                class="mix-blend-multiply snapshot-image"
                @click="toggleDiff"
                :src="`${proxyApi}${devices[device].fullSrcDiff}`"
              />
            </div>
          </div>
          <img
            v-else
            :id="`${devices[device]?.label}-${device ? device : ''}`"
            :src="`${proxyApi}${devices[device]?.fullSrc}`"
            :class="['snapshot-image', { device: !!device }]"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { proxyApi } from '@/plugins/axios'
import useUserStore from '@/stores/use-user-store'
import useSnapshotStore from '@/stores/use-snapshot-store'
import Cursor from '@/components/inputs/Cursor.vue'

const emit = defineEmits(['set-filters'])

const visible = ref(0)
const props = defineProps({
  devices: {
    type: Object,
    default: () => {}
  }
})

const router = useRouter()
const isAdmin = computed(() => useUserStore.user?.role === 'ADMIN')

/** Diff */
const showDiff = ref(true)
const toggleDiff = () => (showDiff.value = !showDiff.value)
/** */

/** Flows */
const approve = async (snapshot) => {
  if (await useSnapshotStore.approve(snapshot.id, snapshot.current.id)) {
    emit('set-filters', 'PENDING')
  }
}

const decline = async (snapshot) => {
  if (await useSnapshotStore.decline(snapshot.id)) {
    emit('set-filters', 'PENDING')
  }
}

const merge = async (snapshot) => {
  if (await useSnapshotStore.merge(snapshot.id)) {
    emit('set-filters', 'MERGE')
  }
}
/** */

/** Image dimension & Cursor */
const snapshotImageWidth = computed(() => window.innerWidth / 2)
const snapshotImageWidthPx = computed(() => `${snapshotImageWidth.value}px`)
const cursor = ref(0)
const computedCursor = computed(() => `${(cursor.value * snapshotImageWidth.value) / 100}px`)
/** */
</script>

<style scoped>
@media screen and (min-width: 992px) {
  .snapshot-image {
    height: auto;
    width: v-bind(snapshotImageWidthPx);
    max-width: v-bind(snapshotImageWidthPx);
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
  border-right: 2px solid red;
}
</style>
