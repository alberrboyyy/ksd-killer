import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import Table from '#models/table'
import Category from '#models/category'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import vine from '@vinejs/vine'

export default class OrdersController {
  /**
   * Show the order-taking screen for a table
   */
  async show({ params, view, auth }: HttpContext) {
    const table = await Table.findOrFail(params.tableId)

    // Get or create active order for this table
    let order = await Order.query()
      .where('table_id', table.id)
      .where('status', 'open')
      .preload('items', (query) => {
        query.preload('product').orderBy('created_at', 'asc')
      })
      .first()

    if (!order) {
      order = await Order.create({
        tableId: table.id,
        userId: auth.user!.id,
        status: 'open',
        guestsCount: 1,
        totalAmount: 0,
      })
      table.status = 'occupied'
      await table.save()
      // Reload with items
      await order.load('items', (query) => {
        query.preload('product').orderBy('created_at', 'asc')
      })
    }

    // Load categories tree
    const categories = await Category.query()
      .whereNull('parent_id')
      .preload('children', (query) => {
        query.preload('products')
      })
      .preload('products')

    return view.render('pages/order', { table, order, categories, isTakeaway: false })
  }

  /**
   * Show the order-taking screen for takeaway
   */
  async takeaway({ view, auth }: HttpContext) {
    const table = await Table.query().where('is_virtual', true).firstOrFail()

    // Get the next takeaway number
    const lastTakeaway = await Order.query()
      .where('table_id', table.id)
      .whereNotNull('takeaway_number')
      .orderBy('takeaway_number', 'desc')
      .first()

    const nextNumber = (lastTakeaway?.takeawayNumber ?? 0) + 1

    // Create a new takeaway order
    const order = await Order.create({
      tableId: table.id,
      userId: auth.user!.id,
      status: 'open',
      guestsCount: 1,
      totalAmount: 0,
      takeawayNumber: nextNumber,
    })

    await order.load('items', (query) => {
      query.preload('product').orderBy('created_at', 'asc')
    })

    const categories = await Category.query()
      .whereNull('parent_id')
      .preload('children', (query) => {
        query.preload('products')
      })
      .preload('products')

    return view.render('pages/order', { table, order, categories, isTakeaway: true })
  }

  /**
   * Add items to an order (AJAX)
   */
  async addItem({ params, request, response, auth }: HttpContext) {
    const order = await Order.findOrFail(params.id)
    if (order.status !== 'open') {
      return response.status(400).json({ error: 'Commande fermée' })
    }

    const validator = vine.create({
      productId: vine.number(),
      quantity: vine.number().min(1).optional(),
      notes: vine.string().optional(),
    })

    const payload = await request.validateUsing(validator)
    const product = await Product.findOrFail(payload.productId)

    // Check if same product already pending in this order
    let existingItem = await OrderItem.query()
      .where('order_id', order.id)
      .where('product_id', product.id)
      .where('status', 'pending')
      .whereNull('notes')
      .first()

    if (existingItem && !payload.notes) {
      existingItem.quantity += (payload.quantity ?? 1)
      await existingItem.save()
      await existingItem.load('product')
    } else {
      existingItem = await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: payload.quantity ?? 1,
        unitPrice: product.price,
        status: 'pending',
        notes: payload.notes ?? null,
        createdBy: auth.user!.id,
      })
      await existingItem.load('product')
    }

    // Recalculate total
    await this.recalculateTotal(order)

    return response.json({
      item: existingItem,
      total: order.totalAmount,
    })
  }

  /**
   * Remove an item from order (only if pending)
   */
  async removeItem({ params, response }: HttpContext) {
    const item = await OrderItem.findOrFail(params.itemId)
    const order = await Order.findOrFail(item.orderId)

    if (item.status !== 'pending') {
      return response.status(400).json({ error: 'Item déjà en préparation' })
    }

    await item.delete()
    await this.recalculateTotal(order)

    return response.json({ success: true, total: order.totalAmount })
  }

  /**
   * Update item quantity (only if pending)
   */
  async updateItemQuantity({ params, request, response }: HttpContext) {
    const item = await OrderItem.findOrFail(params.itemId)
    const order = await Order.findOrFail(item.orderId)

    if (item.status !== 'pending') {
      return response.status(400).json({ error: 'Item déjà en préparation' })
    }

    const validator = vine.create({
      quantity: vine.number().min(1),
    })
    const { quantity } = await request.validateUsing(validator)

    item.quantity = quantity
    await item.save()
    await this.recalculateTotal(order)

    return response.json({ item, total: order.totalAmount })
  }

  /**
   * Send pending items to kitchen/bar
   */
  async sendItems({ params, response }: HttpContext) {
    const order = await Order.findOrFail(params.id)
    const pendingItems = await OrderItem.query()
      .where('order_id', order.id)
      .where('status', 'pending')
      .preload('product')

    if (pendingItems.length === 0) {
      return response.status(400).json({ error: 'Aucun item à envoyer' })
    }

    // Mark as in_progress
    for (const item of pendingItems) {
      item.status = 'in_progress'
      await item.save()
    }

    return response.json({ success: true, sentCount: pendingItems.length })
  }

  /**
   * Show the bill for an order
   */
  async bill({ params, view }: HttpContext) {
    const order = await Order.query()
      .where('id', params.id)
      .preload('items', (query) => {
        query.preload('product').orderBy('created_at', 'asc')
      })
      .preload('table')
      .firstOrFail()

    return view.render('pages/bill', { order })
  }

  /**
   * Pay an order
   */
  async pay({ params, request, response }: HttpContext) {
    const order = await Order.findOrFail(params.id)

    const validator = vine.create({
      paymentMethod: vine.enum(['cash', 'card']),
    })
    const { paymentMethod } = await request.validateUsing(validator)

    order.status = 'paid'
    order.paymentMethod = paymentMethod
    await order.save()

    // Free the table
    const table = await Table.findOrFail(order.tableId)
    if (!table.isVirtual) {
      // Check if there are other open orders on this table
      const otherOrders = await Order.query()
        .where('table_id', table.id)
        .where('status', 'open')
        .whereNot('id', order.id)
        .first()

      if (!otherOrders) {
        table.status = 'free'
        await table.save()
      }
    }

    return response.json({ success: true })
  }

  /**
   * Update guests count
   */
  async updateGuests({ params, request, response }: HttpContext) {
    const order = await Order.findOrFail(params.id)
    const validator = vine.create({
      guestsCount: vine.number().min(1),
    })
    const { guestsCount } = await request.validateUsing(validator)
    order.guestsCount = guestsCount
    await order.save()
    return response.json({ success: true })
  }

  /**
   * Recalculate order total
   */
  private async recalculateTotal(order: Order) {
    const items = await OrderItem.query().where('order_id', order.id)
    let total = 0
    for (const item of items) {
      total += item.unitPrice * item.quantity
    }
    order.totalAmount = Math.round(total * 100) / 100
    await order.save()
  }
}
