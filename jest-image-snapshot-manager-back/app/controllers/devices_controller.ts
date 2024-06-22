import type { HttpContext } from '@adonisjs/core/http'
import Device from '../models/Device.js'
import Snapshot from '../models/snapshot.js'

export default class DevicesController {
  async index({ auth }: HttpContext) {
    return await Device.findManyBy('organization', auth.user?.organization)
  }

  async store({ auth, request }: HttpContext) {
    return await Device.create({ ...request.body(), organization: auth.user?.organization })
  }

  async delete({ request }: HttpContext) {
    const user = await Device.findOrFail(request.param('id'))
    return await user.delete()
	}
}
