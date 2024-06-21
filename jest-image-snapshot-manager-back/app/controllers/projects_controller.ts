import type { HttpContext } from '@adonisjs/core/http'
import Project from '../models/project.js'
import Snapshot from '../models/snapshot.js'

export default class ProjectsController {
  async index({ auth }: HttpContext) {
    return await Project.findManyBy('organization', auth.user?.organization)
  }

  async store({ auth, request }: HttpContext) {
    return await Project.create({ ...request.body(), organization: auth.user?.organization})
  }

  async delete({ request }: HttpContext) {
    const user = await Project.findOrFail(request.param('id'))
    return await user.delete()
  }

  async archive({ request }: HttpContext) {
    const snapshots = await Snapshot.query()
      .where('projectId', request.param('id'))
      .andWhere('version', request.param('idVersion'))

    return await Promise.all(
      snapshots.map(async (e: any) => {
        e.archived = true
        await e.save()
        return e.toJSON()
      })
    )
  }

  async unarchive({ request }: HttpContext) {
    const snapshots = await Snapshot.query()
      .where('projectId', request.param('id'))
      .andWhere('version', request.param('idVersion'))

    return await Promise.all(
      snapshots.map(async (e: any) => {
        e.archived = false
        await e.save()
        return e.toJSON()
      })
    )
  }
}
