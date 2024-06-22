import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
			table.string('organization').notNullable()
      table.string('label').notNullable()
      table.string('path').notNullable()
      table.string('path_tests').notNullable()
      table.boolean('commit_in_progress').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
