import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        organization: 'bc461107-93ad-46d8-89c4-84208b5097bd',
        email: 'system@system.com',
				password: uuidv4(),
        role: 'SYSTEM',
      },
      {
        organization: 'bc461107-93ad-46d8-89c4-84208b5097bd',
        email: 'admin@admin.com',
        role: 'ADMIN',
        active: true,
      },
    ])
  }
}
