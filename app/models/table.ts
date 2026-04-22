import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'

export default class Table extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare number: number

  @column()
  declare seats: number

  @column()
  declare status: 'free' | 'occupied' | 'paid'

  @column()
  declare isVirtual: boolean

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
