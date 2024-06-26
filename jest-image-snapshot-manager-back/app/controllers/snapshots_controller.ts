import type { HttpContext } from '@adonisjs/core/http'
import Snapshot from '../models/snapshot.js'
import { canValidateSnapshot } from '../abilities/user.js'
import Flow from '../services/flow.js'
import User from '../models/user.js'

export default class SnapshotsController {
  async index({ auth }: HttpContext) {
    const projectIds = (
      await User.query()
        .where('id', auth.user?.id || '')
        .preload('projects')
        .firstOrFail()
    ).projects.map((e) => e.toJSON().id)
    const snapshots = await Snapshot.query().whereIn('projectId', projectIds)
    return snapshots.map((e: Snapshot) => e.toJSON()) || []
  }

  async get({ request }: HttpContext) {
    const snapshot = await Snapshot.findOrFail(request.param('id'))
    return snapshot.toJSON()
  }

  async delete({ request }: HttpContext) {
    //TODO: delete file
    const user = await Snapshot.findOrFail(request.param('id'))
    return await user.delete()
  }

  async approve(ctx: HttpContext) {
    if (!canValidateSnapshot(ctx)) {
      return
    }

    const { auth, request } = ctx
    const truthSnapshot = await Snapshot.findOrFail(request.body().truthId)
    truthSnapshot.truth = false
    await truthSnapshot.save()

    const snapshot = await Snapshot.findOrFail(request.param('id'))
    snapshot.truth = true
    snapshot.validatorId = auth.user?.id || -1
    snapshot.status = 'APPROVE'
    await snapshot.save()
    return snapshot.toJSON()
  }

  async decline(ctx: HttpContext) {
    if (!canValidateSnapshot(ctx)) {
      return
    }

    const { auth, request } = ctx
    const snapshot = await Snapshot.findOrFail(request.param('id'))
    snapshot.validatorId = auth.user?.id || -1
    snapshot.status = 'DECLINE'
    await snapshot.save()
    return snapshot.toJSON()
  }

  async merge({ auth, request }: HttpContext) {
    const snapshot = await Snapshot.findOrFail(request.param('id'))
    return await Flow.merge(
      auth.user?.organization || '',
      snapshot.projectId,
      snapshot.version,
      snapshot.id
    )
  }

  async archive({ request }: HttpContext) {
    const snapshots = await Snapshot.query().whereIn('id', request.body().ids)
    return await Promise.all(
      snapshots.map(async (e) => {
        e.archived = true
        return await e.save()
      })
    )
  }

  async unarchive({ request }: HttpContext) {
    const snapshots = await Snapshot.query().whereIn('id', request.body().ids)
    return await Promise.all(
      snapshots.map(async (e) => {
        e.archived = false
        return await e.save()
      })
    )
  }
}
