import type { HttpContext } from '@adonisjs/core/http'
import Flow from '../services/flow.ts'

export default class RunnersController {
  async commit({ auth, request }: HttpContext) {
    return await Flow.commit(
      auth.user?.organization || '',
      request.param('id'),
      +request.param('version')
    )
  }

  async merge({ auth, request }: HttpContext) {
    return await Flow.merge(
      auth.user?.organization || '',
      request.param('id'),
      +request.param('version')
    )
  }
}
