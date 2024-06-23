import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Project from './project.js'
import { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organization: string

  @column()
  declare label: string

  @column()
  declare suffix: string

  @column()
  declare height: number

  @column()
  declare width: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
