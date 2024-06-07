import type { HttpContext } from '@adonisjs/core/http'
import Flow from '../services/flow.ts'

export default class RunnersController {
  async commit({ request }: HttpContext) {
    return await Flow.commit(request.param('id'), +request.param('version'))
  }

  async merge({ request }: HttpContext) {
    return await Flow.merge(request.param('id'), +request.param('version'))
  }
}
