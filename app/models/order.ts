import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import User from '#models/user'
import OrderItem from '#models/order_item'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tableId: number

  @column()
  declare userId: number | null

  @column()
  declare guestsCount: number

  @column()
  declare status: 'open' | 'paid' | 'cancelled'

  @column()
  declare paymentMethod: 'cash' | 'card' | null

  @column()
  declare takeawayNumber: number | null

  @column()
  declare totalAmount: number

  @belongsTo(() => Table)
  declare table: BelongsTo<typeof Table>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
