import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import Mails from '../services/mails.js'
import { Exception } from '@adonisjs/core/exceptions'
import router from '@adonisjs/core/services/router'
import env from '../../start/env.js'

const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length)
export default class UsersController {
  async index() {
    return await User.query().preload('projects')
  }

  async invite({ request }: HttpContext) {
    const { email } = request.body()
    const password = generateRandomString()
    const user = await User.create({ email, password })
    const link = `${env.get('FRONT_BASE_URL')}/confirm-account#${router.makeSignedUrl('confirmAccount', { email: user.email })}`
    return await Mails.invite(user, link, password)
  }

  async signIn({ request }: HttpContext) {
    const { email, password } = request.body()
    const user = await User.create({ email, password })
    const link = `${env.get('FRONT_BASE_URL')}/confirm-account#${router.makeSignedUrl('confirmAccount', { email: user.email })}`
    return await Mails.register(user, link)
  }

  async confirmAccount({ request }: HttpContext) {
    if (request.hasValidSignature()) {
      const user = await User.findByOrFail('email', request.param('email'))
      user.active = true
      return await user?.save()
    }
    throw new Exception('Unvalid email verification signature')
  }

  async resetPassword({ request }: HttpContext) {
    const { email } = request.body()
    const user = await User.findByOrFail('email', email)
    const newPassword = generateRandomString()
    user.password = newPassword
    await user.save()
    return await Mails.reset(user, newPassword)
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
}
