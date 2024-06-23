import { api } from '@/plugins/axios'
import { useToast } from 'vue-toastification'
const toast = useToast()

export default reactive({
  snapshots: [],
  fullSnapshots: [],
  async fetch(force = false) {
    if (this.snapshots.lenth === 0 || force) {
      try {
        this.snapshots = (await api.get('/snapshot'))?.data || []
        this.fullSnapshots = this.snapshots
        const truthIds = this.snapshots
          .filter((e) => !e.archived)
          .map((e) => e.truthId)
          .filter(Boolean)
        this.snapshots = this.snapshots.filter((e) => !e.archived || truthIds.includes(e.id))
      } catch (err) {
        toast.error('Snapshots fetch error')
      }
    }
  },
  async archive(snapshot) {
    try {
      if (
        await api.put(`/snapshot/${snapshot.id}/archive`, {
          ids: this.fullSnapshots.filter((e) => e.label === snapshot.label).map((e) => e.id)
        })
      )
        toast.success('Snapshot archived successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Archive snapshot error')
    }
  },
  async unarchive(snapshot) {
    try {
      if (
        await api.put(`/snapshot/${snapshot.id}/unarchive`, {
          ids: this.fullSnapshots.filter((e) => e.label === snapshot.label).map((e) => e.id)
        })
      )
        toast.success('Snapshot restored successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Unarchive snapshot error')
    }
  },
  async remove(snapshotId) {
    try {
      if (await api.delete(`/snapshot/${snapshotId}`))
        toast.success('Snapshot removed successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Remove snapshot error')
    }
  },
  async approve(snapshotId, truthId) {
    try {
      if (await api.post(`/snapshot/${snapshotId}/approve`, { truthId }))
        toast.success('Snapshot approved successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Approve snapshot error')
    }
  },
  async decline(snapshotId) {
    try {
      if (await api.get(`/snapshot/${snapshotId}/decline`))
        toast.success('Snapshot declined successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Decline snapshot error')
    }
  },
  async merge(snapshotId) {
    try {
      if (await api.get(`/snapshot/${snapshotId}/merge`))
        toast.success('Snapshot merged successfully')
      await this.fetch(true)
			return true
    } catch {
      toast.error('Merge snapshot error')
    }
  }
})
