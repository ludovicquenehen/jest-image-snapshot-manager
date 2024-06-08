import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'system@system.com',
        role: 'SYSTEM',
      },
      {
        email: 'admin@admin.com',
        role: 'ADMIN',
        active: true,
      },
    ])
  }
}
