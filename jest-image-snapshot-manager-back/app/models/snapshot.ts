import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, hasOne, column, computed } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Project from './project.js'
import { v4 as uuidv4 } from 'uuid'

type STATUS = 'REQUEST' | 'APPROVE' | 'DECLINE' | 'MERGE' | 'CLOSE'

export default class Snapshot extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare version: number

  @column()
  declare versionIteration: number

  @column()
  declare label: string

  @hasOne(() => User)
  declare validator: HasOne<typeof User>

  @column()
  declare validatorId: number

  @column()
  declare truthId: number | null

  @hasOne(() => Project)
  declare project: HasOne<typeof Project>

  @column()
  declare projectId: number

  // Si srcDiff alors c'est une image RECEIVED
  @column()
  declare src: string

  @computed()
  get fullSrc() {
    return `/snapshots/${this.projectId}/${this.version}/${this.versionIteration}/${this.src.replace('.png', '')}.png`
  }

  @computed()
  get fullSrcDiff() {
    return this.srcDiff
      ? `/snapshots/${this.projectId}/${this.version}/${this.versionIteration}/${this.srcDiff.replace('.png', '')}.png`
      : null
  }

  // Si pas de srcDiff alors c'est une image DIFF
  @column()
  declare srcDiff: string | null

  @column()
  declare truth: boolean

  @column()
  declare status: STATUS

  @column()
  declare comment: string

  @column()
  declare archived: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignStatus(snapshot: Snapshot) {
		snapshot.id = uuidv4();
    snapshot.status = 'REQUEST'
    snapshot.validatorId = 1
  }
}
