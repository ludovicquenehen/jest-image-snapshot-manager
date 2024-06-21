import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Project from '../../app/models/project.js'

export default class extends BaseSeeder {
  async run() {
    await Project.createMany([{ organization: "bc461107-93ad-46d8-89c4-84208b5097bd", label: 'Test', path: 'example', pathTests: 'example/tests' }])
  }
}
