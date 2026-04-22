import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Order from '#models/order'

export default class FloorController {
  /**
   * Display the floor plan with all tables and their current status
   */
  async index({ view }: HttpContext) {
    const tables = await Table.query()
      .where('is_virtual', false)
      .orderBy('number', 'asc')

    // Get active orders for occupied tables
    const activeOrders = await Order.query()
      .where('status', 'open')
      .preload('items')

    const tableOrderMap: Record<number, typeof activeOrders[0]> = {}
    for (const order of activeOrders) {
      tableOrderMap[order.tableId] = order
    }

    return view.render('pages/floor', { tables, tableOrderMap })
  }
}
