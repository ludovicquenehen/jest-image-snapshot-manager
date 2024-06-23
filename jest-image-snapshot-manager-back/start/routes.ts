import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UserProjectsController = () => import('../app/controllers/user_projects_controller.js')
const AuthenticationController = () => import('../app/controllers/authentication_controller.js')
const DevicesController = () => import('../app/controllers/devices_controller.js')
const ProjectsController = () => import('../app/controllers/projects_controller.js')
const RunnersController = () => import('../app/controllers/runners_controller.js')
const SnapshotsController = () => import('../app/controllers/snapshots_controller.js')
const UsersController = () => import('../app/controllers/users_controller.js')
const DevicesProjectsController = () => import('../app/controllers/devices_projects_controller.js')

router
  .group(() => {
    /** Authentication */
    router.post('login', [AuthenticationController, 'login'])
    router.get('me', [AuthenticationController, 'me']).use(middleware.auth())
    router.get('logout', [AuthenticationController, 'logout']).use(middleware.auth())

    /** User */
    router.post('sign-in', [UsersController, 'signIn'])
    router.get('confirm-account/:email', [UsersController, 'confirmAccount']).as('confirmAccount')
    router.post('reset-password', [UsersController, 'resetPassword'])
    router.get('users', [UsersController, 'index']).use(middleware.auth())
    router.put('user', [UsersController, 'invite']).use(middleware.auth()).use(middleware.admin())
    router
      .post('user/:id', [UsersController, 'update'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .delete('user/:id', [UsersController, 'delete'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .get('user/:id/join/:projectId', [UserProjectsController, 'join'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .get('user/:id/leave/:projectId', [UserProjectsController, 'leave'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Project */
    router.get('project', [ProjectsController, 'index']).use(middleware.auth())
    router.put('project', [ProjectsController, 'store']).use(middleware.auth())
    router
      .delete('project/:id', [ProjectsController, 'delete'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Device */
    router.get('device', [DevicesController, 'index']).use(middleware.auth())
    router.put('device', [DevicesController, 'store']).use(middleware.auth())
    router
      .delete('device/:id', [DevicesController, 'delete'])
      .use(middleware.auth())
      .use(middleware.admin())
		router
      .get('device/assign/:id/:projectId', [DevicesProjectsController, 'assign'])
      .use(middleware.auth())
      .use(middleware.admin())
		router
      .get('device/unassign/:id/:projectId', [DevicesProjectsController, 'unassign'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Archive version */
    router
      .get('project/:id/archive/:idVersion', [ProjectsController, 'archive'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .get('project/:id/unarchive/:idVersion', [ProjectsController, 'unarchive'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Snapshot */
    router.get('snapshot', [SnapshotsController, 'index']).use(middleware.auth())
    router
      .put('snapshot/:id/archive', [SnapshotsController, 'archive'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .put('snapshot/:id/unarchive', [SnapshotsController, 'unarchive'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .delete('snapshot/:id', [SnapshotsController, 'delete'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Flow */
    router.post('snapshot/:id/approve', [SnapshotsController, 'approve']).use(middleware.auth())
    router.get('snapshot/:id/decline', [SnapshotsController, 'decline']).use(middleware.auth())
    router
      .get('snapshot/:id/merge', [SnapshotsController, 'merge'])
      .use(middleware.auth())
      .use(middleware.admin())

    /** Runner */
    router
      .get('run/commit/:id/:version', [RunnersController, 'commit'])
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .get('run/merge/:id/:version', [RunnersController, 'merge'])
      .use(middleware.auth())
      .use(middleware.admin())
  })
  .prefix('v1')
