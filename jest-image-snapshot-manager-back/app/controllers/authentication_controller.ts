import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.body()
    const user = await User.verifyCredentials(email, password)

    if (!user.active) {
      {
        return response.unauthorized({ message: 'Must confirm email' })
      }
    }

    const token = await User.accessTokens.create(user)

    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }

  async me({ auth }: HttpContext) {
    if (!auth.user) {
      return null
    }
    return await User.query().where('id', auth.user?.id).preload('projects').first()
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken.identifier
    if (!token) {
      return response.badRequest({ message: 'Token not found' })
    }
    await User.accessTokens.delete(user, token)
    return response.ok({ message: 'Logged out' })
  }
}
