import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'devices_projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

			table.integer('device_id').unsigned().references('devices.id')
      table.integer('project_id').unsigned().references('projects.id')
      table.unique(['device_id', 'project_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}