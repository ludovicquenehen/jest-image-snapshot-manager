import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Project from '../../app/models/project.js'

export default class extends BaseSeeder {
  async run() {
    await Project.createMany([{ label: 'Test', path: 'example', pathTests: 'example/tests' }])
  }
}
