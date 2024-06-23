import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import Mails from '../services/mails.js'
import { Exception } from '@adonisjs/core/exceptions'
import router from '@adonisjs/core/services/router'
import env from '../../start/env.js'
import { v4 as uuidv4 } from 'uuid'

const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length)
export default class UsersController {
  async index({ auth }: HttpContext) {
    return await User.query()
      .where('organization', auth.user?.organization || '')
      .preload('projects')
  }

  async invite({ auth, request }: HttpContext) {
    const { email, role } = request.body()
    const password = generateRandomString()
    const organization = auth.user?.organization
    const user = await User.create({ organization, email, password, role })
    const link = `${env.get('FRONT_BASE_URL')}/confirm-account#${router.makeSignedUrl('confirmAccount', { email: user.email })}`
    return await Mails.invite(user, link, password)
  }

  async signIn({ request }: HttpContext) {
    const { organization } = request.body()
    const newOrganization = uuidv4()
    const user = await User.create({ organization: newOrganization, ...request.body(), role: organization ? 'USER' : 'ADMIN' })
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

  async activate({ request }: HttpContext) {
    const user = await User.findOrFail(request.param('id'))
    user.active = !user.active
    return await user.save()
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
