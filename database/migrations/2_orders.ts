import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('table_id')
        .unsigned()
        .references('id')
        .inTable('tables')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()
      table.integer('guests_count').notNullable().defaultTo(1)
      table.string('status').notNullable().defaultTo('open') // open, paid, cancelled
      table.string('payment_method').nullable() // cash, card, null
      table.integer('takeaway_number').nullable() // for virtual/takeaway orders
      table.decimal('total_amount', 10, 2).notNullable().defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
