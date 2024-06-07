import { HttpContext } from '@adonisjs/core/http'
import UserProject from '../models/user_project.js'

export const canValidateSnapshot = async ({ auth, request }: HttpContext) => {
  const userId = auth.user?.id
  const projectId = request.param('id')

  if (!userId || !projectId) {
    return
  }

  const allow = await UserProject.query().where('user_id', userId).andWhere('project_id', projectId)
  return allow.length > 0
}
