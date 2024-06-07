import type { HttpContext } from '@adonisjs/core/http'
import Snapshot from '../models/snapshot.js'
import { canValidateSnapshot } from '../abilities/user.js'
import Files from '../services/files.js'
import Project from '../models/project.js'

export default class SnapshotsController {
  async index() {
    const snapshots = await Snapshot.query()
    return snapshots.map((e: Snapshot) => e.toJSON()) || []
  }

  async get({ request }: HttpContext) {
    const snapshot = await Snapshot.findOrFail(request.param('id'))
    return snapshot.toJSON()
  }

  async delete({ request }: HttpContext) {
    const user = await Snapshot.findOrFail(request.param('id'))
    return await user.delete()
  }

  async commit({ request }: HttpContext) {
    const snapshot = await Snapshot.create(request.body())
    return snapshot.toJSON()
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

  async merge({ request }: HttpContext) {
    const snapshot = await Snapshot.findOrFail(request.param('id'))
    snapshot.status = 'MERGE'
    await snapshot.save()
    return snapshot.toJSON()
  }

  async archive({ request }: HttpContext) {
    const snapshots = await Snapshot.query().whereIn('id', request.body().ids)
    return await Promise.all(
      snapshots.map(async (e) => {
        e.archived = true
        return await e.save()
      })
    )

    // snapshot.archived = true
    // const project = await Project.findOrFail(snapshot.projectId)
    // const projectPath = env.get(`${project.env}_TESTS` as any)
    // //KO:
    // // await Files.unlink(`${projectPath}/__image_snapshots__/${snapshot.src}`)
    // // await Files.unlink(`${projectPath}/__image_snapshots__/${snapshot.src}`)
    // return await snapshot.save()
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