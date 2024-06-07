import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'snapshots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('version').notNullable()
      table.integer('version_iteration').notNullable()
      table.string('label').notNullable()
      table.integer('validator_id').notNullable()
      table.integer('project_id').notNullable()
      table.integer('truth_id').nullable()
      table.string('src').notNullable()
      table.string('src_diff')
      table.boolean('truth').defaultTo(false)
      table.boolean('status').notNullable()
      table.string('comment').nullable()
      table.boolean('archived').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
