import type { HttpContext } from '@adonisjs/core/http'
import OrderItem from '#models/order_item'

export default class BarController {
  /**
   * Display the Bar Display Screen
   */
  async display({ view }: HttpContext) {
    const items = await this.getActiveItems()
    return view.render('pages/bar-display', { items, destination: 'bar' })
  }

  /**
   * Get active bar items as JSON (for polling)
   */
  async items({ response }: HttpContext) {
    const items = await this.getActiveItems()
    return response.json(items)
  }

  /**
   * Update item status
   */
  async updateStatus({ params, request, response }: HttpContext) {
    const item = await OrderItem.findOrFail(params.itemId)
    const { status } = request.only(['status'])

    if (!['in_progress', 'ready', 'served'].includes(status)) {
      return response.status(400).json({ error: 'Statut invalide' })
    }

    item.status = status
    await item.save()

    return response.json({ success: true, item })
  }

  private async getActiveItems() {
    return OrderItem.query()
      .whereIn('status', ['in_progress'])
      .preload('product', (query) => {
        query.where('destination', 'bar')
      })
      .preload('order', (query) => {
        query.preload('table')
      })
      .whereHas('product', (query) => {
        query.where('destination', 'bar')
      })
      .orderBy('created_at', 'asc')
  }
}
