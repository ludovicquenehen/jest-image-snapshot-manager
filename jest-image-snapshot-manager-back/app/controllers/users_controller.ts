import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'

export default class UsersController {
  async index() {
    return await User.query().preload('projects')
  }

  async store({ request }: HttpContext) {
    return await User.create(request.body())
  }

  async get({ request }: HttpContext) {
    return await User.findOrFail(request.param('id'))
  }

  async update({ request }: HttpContext) {
    let user = await User.findOrFail(request.param('id'))
    return await user.merge({ ...request.body() }).save()
  }

  async delete({ request }: HttpContext) {
    const user = await User.findOrFail(request.param('id'))
    return await user.delete()
  }

  async resetPassword({ request }: HttpContext) {
    const { email } = await request.body()
    const user = await User.findByOrFail('email', email)
    user.password = user.email
    return await user.save()
  }
}
