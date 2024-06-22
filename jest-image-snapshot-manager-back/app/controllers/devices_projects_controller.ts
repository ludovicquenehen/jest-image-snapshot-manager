import type { HttpContext } from '@adonisjs/core/http'
import Project from '../models/project.js'
import Device from '../models/Device.js'

export default class DevicesProjectsController {
  async assign({ request }: HttpContext) {
		console.log(request.param('id'), request.param('projectId'))
    const device = await Device.findOrFail(request.param('id'))
    const project = await Project.findOrFail(request.param('projectId'))
    await project.related('devices').attach([device.id])
    await project.save()
    return project
  }

  async unassign({ request }: HttpContext) {
    const device = await Device.findOrFail(request.param('id'))
    const project = await Project.findOrFail(request.param('projectId'))
    await project.related('devices').detach([device.id])
    await project.save()
    return project
  }
}
