import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '../models/user.js'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
		const user = await User.findOrFail(ctx.auth.user?.id)
    if (user.role !== 'ADMIN') {
      throw new Exception('Admin only')
    }

    return await next()
  }
}
