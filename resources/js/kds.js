export default (apiUrl, destination) => ({
  orderGroups: [],
  apiUrl,
  destination,

  init() {
    this.fetchItems()
    setInterval(() => this.fetchItems(), 3000)
  },

  async fetchItems() {
    try {
      const res = await fetch(this.apiUrl)
      const items = await res.json()

      const groups = {}
      for (const item of items) {
        const tableNum = item.order?.table?.number
        const isVirtual = item.order?.table?.isVirtual
        const takeaway = item.order?.takeawayNumber
        const label = isVirtual ? `Emporté #${takeaway || '?'}` : `Table ${tableNum}`
        const key = `${item.order?.id}`

        if (!groups[key]) {
          groups[key] = {
            tableLabel: label,
            orderId: item.order?.id,
            items: [],
            age: 0,
          }
        }

        groups[key].items.push({
          id: item.id,
          productName: item.product?.name || 'Produit',
          quantity: item.quantity,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
        })

        if (item.createdAt) {
          const created = new Date(item.createdAt)
          const age = Math.round((Date.now() - created.getTime()) / 60000)
          if (age > groups[key].age) {
            groups[key].age = age
          }
        }
      }

      this.orderGroups = Object.values(groups)
    } catch (e) {
      console.error('KDS fetch error:', e)
    }
  },

  async toggleStatus(item, group) {
    const newStatus = 'ready' // It only goes one way now
    const baseUrl = this.destination === 'bar' ? '/api/bar' : '/api/kitchen'

    try {
      await fetch(`${baseUrl}/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      // Remove item instantly from the group
      group.items = group.items.filter(i => i.id !== item.id)
      
      // If group is empty, remove it instantly
      if (group.items.length === 0) {
        this.orderGroups = this.orderGroups.filter(g => g.orderId !== group.orderId)
      }
    } catch (e) {
      console.error('Toggle status error:', e)
    }
  },

  async markAllReady(group) {
    // Copy the array because we will be mutating it
    const itemsToMark = [...group.items]
    for (const item of itemsToMark) {
      await this.toggleStatus(item, group)
    }
  },
})
