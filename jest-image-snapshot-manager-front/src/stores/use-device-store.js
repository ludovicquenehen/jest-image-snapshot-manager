import { api } from '@/plugins/axios'
import { useToast } from 'vue-toastification'
const toast = useToast()

export default reactive({
  devices: [],
  async fetch(force = false) {
    if (this.devices.length === 0 || force) {
      try {
        this.devices = (await api.get('/device'))?.data || []
      } catch (err) {
        toast.error('Devices fetch error')
      }
    }
  },
  async add(device) {
    try {
      if (await api.put('/device', { ...device })) toast.success('Device added successfully')
      await this.fetch(true)
    } catch {
      toast.error('Add device error')
    }
  },
  async remove(deviceId) {
    try {
      if (await api.delete(`/device/${deviceId}`)) toast.success('Device removed successfully')
      await this.fetch(true)
    } catch {
      toast.error('Remove device error')
    }
  },
	async assign(deviceId, projectId) {
    try {
      if (await api.get(`/device/assign/${deviceId}/${projectId}`)) toast.success('Device assigned successfully')
      await this.fetch(true)
    } catch {
      toast.error('Assign device error')
    }
  },
	async unassign(deviceId, projectId) {
    try {
      if (await api.get(`/device/unassign/${deviceId}/${projectId}`)) toast.success('Device unassigned successfully')
      await this.fetch(true)
    } catch {
      toast.error('Unassign device error')
    }
  },
})
