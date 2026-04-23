export default (config) => ({
  orderId: config.orderId,
  items: config.items || [],
  total: config.total || 0,
  activeMainCategory: null,
  cartOpen: false,
  catalogOpen: false,
  loading: false,

  get hasPending() {
    return this.items.some((i) => i.status === 'pending')
  },

  init() {
    // Attempt to set activeMainCategory from server data if we could pass it,
    // otherwise we handle it in the view via x-init
  },

  async addItem(el) {
    if (this.loading) return
    this.loading = true

    const productId = parseInt(el.dataset.productId)
    const name = el.dataset.productName
    const price = parseFloat(el.dataset.productPrice)

    // Animate the product card
    el.classList.add('just-added')
    setTimeout(() => el.classList.remove('just-added'), 300)

    try {
      const res = await fetch(`/api/orders/${this.orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.item) {
        const existing = this.items.find((i) => i.id === data.item.id)
        if (existing) {
          existing.qty = data.item.quantity
        } else {
          this.items.push({
            id: data.item.id,
            name: data.item.product?.name || name,
            qty: data.item.quantity,
            price: data.item.unitPrice,
            status: data.item.status,
            notes: data.item.notes,
          })
        }
        this.total = data.total
      }
    } catch (e) {
      console.error('Add item error:', e)
    } finally {
      this.loading = false
    }
  },

  async removeItem(itemId) {
    try {
      const res = await fetch(`/api/orders/items/${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        this.items = this.items.filter((i) => i.id !== itemId)
        this.total = data.total
      }
    } catch (e) {
      console.error('Remove item error:', e)
    }
  },

  async sendItems() {
    if (this.loading) return
    this.loading = true
    try {
      const res = await fetch(`/api/orders/${this.orderId}/send`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        this.items.forEach((i) => {
          if (i.status === 'pending') i.status = 'in_progress'
        })
      }
    } catch (e) {
      console.error('Send items error:', e)
    } finally {
      this.loading = false
    }
  },

  statusLabel(status) {
    const labels = { pending: 'En attente', in_progress: 'En cours', ready: 'Prêt', served: 'Servi' }
    return labels[status] || status
  },
})
