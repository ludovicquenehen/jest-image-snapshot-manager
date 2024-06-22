import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Snapshot from './snapshot.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Device from './Device.js'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

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

  @manyToMany(() => Device, {
    pivotTable: 'devices_projects',
    localKey: 'id',
    pivotForeignKey: 'project_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'device_id',
    pivotTimestamps: true,
  })
  declare devices: ManyToMany<typeof Device>
}
