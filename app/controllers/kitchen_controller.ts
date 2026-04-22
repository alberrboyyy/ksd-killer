import type { HttpContext } from '@adonisjs/core/http'
import OrderItem from '#models/order_item'

export default class KitchenController {
  /**
   * Display the Kitchen Display Screen
   */
  async display({ view }: HttpContext) {
    const items = await this.getActiveItems('cuisine')
    return view.render('pages/kitchen-display', { items, destination: 'cuisine' })
  }

  /**
   * Get active kitchen items as JSON (for polling/SSE)
   */
  async items({ response }: HttpContext) {
    const items = await this.getActiveItems('cuisine')
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

  private async getActiveItems(destination: string) {
    return OrderItem.query()
      .whereIn('status', ['in_progress'])
      .preload('product', (query) => {
        query.where('destination', destination)
      })
      .preload('order', (query) => {
        query.preload('table')
      })
      .whereHas('product', (query) => {
        query.where('destination', destination)
      })
      .orderBy('created_at', 'asc')
  }
}
