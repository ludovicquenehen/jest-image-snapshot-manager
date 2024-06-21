import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import Snapshot from './snapshot.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

	@column()
  declare organization: string

  @column()
  declare label: string

  @column()
  declare env: string

  @column()
  declare path: string

  @column()
  declare pathTests: string

  @column()
  declare commitInProgress: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Snapshot)
  declare snapshots: HasMany<typeof Snapshot>

	@beforeCreate()
  static async assignUuid(project: Project) {
    project.id = uuidv4();
  }
}
