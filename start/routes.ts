/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const SessionController = () => import('#controllers/session_controller')
const FloorController = () => import('#controllers/floor_controller')
const OrdersController = () => import('#controllers/orders_controller')
const KitchenController = () => import('#controllers/kitchen_controller')
const BarController = () => import('#controllers/bar_controller')

// ── Auth (guest only) ──────────────────────────────
router
  .group(() => {
    router.get('/login', [SessionController, 'create']).as('login')
    router.post('/login', [SessionController, 'store'])
  })
  .use(middleware.guest())

// ── Authenticated routes ───────────────────────────
router
  .group(() => {
    router.post('/logout', [SessionController, 'destroy']).as('logout')

    // Floor (main screen)
    router.get('/', [FloorController, 'index']).as('floor')

    // Orders
    router.get('/table/:tableId/order', [OrdersController, 'show']).as('order.show')
    router.get('/takeaway', [OrdersController, 'takeaway']).as('order.takeaway')
    router.get('/order/:id/bill', [OrdersController, 'bill']).as('order.bill')

    // Order API (AJAX)
    router.post('/api/orders/:id/items', [OrdersController, 'addItem']).as('order.addItem')
    router.delete('/api/orders/items/:itemId', [OrdersController, 'removeItem']).as('order.removeItem')
    router.patch('/api/orders/items/:itemId/quantity', [OrdersController, 'updateItemQuantity']).as('order.updateItemQuantity')
    router.post('/api/orders/:id/send', [OrdersController, 'sendItems']).as('order.send')
    router.post('/api/orders/:id/pay', [OrdersController, 'pay']).as('order.pay')
    router.patch('/api/orders/:id/guests', [OrdersController, 'updateGuests']).as('order.updateGuests')

    // Kitchen Display
    router.get('/kitchen', [KitchenController, 'display']).as('kitchen.display')
    router.get('/api/kitchen/items', [KitchenController, 'items']).as('kitchen.items')
    router.patch('/api/kitchen/:itemId/status', [KitchenController, 'updateStatus']).as('kitchen.updateStatus')

    // Bar Display
    router.get('/bar', [BarController, 'display']).as('bar.display')
    router.get('/api/bar/items', [BarController, 'items']).as('bar.items')
    router.patch('/api/bar/:itemId/status', [BarController, 'updateStatus']).as('bar.updateStatus')
  })
  .use(middleware.auth())
