import Alpine from 'alpinejs'

// ─── Order App (for order-taking screen) ───
Alpine.data('orderApp', (config) => ({
  orderId: config.orderId,
  items: config.items || [],
  total: config.total || 0,
  activeMainCategory: null,
  cartOpen: false,
  catalogOpen: false,
  loading: false,

  init() {
    // Attempt to set activeMainCategory from server data if we could pass it,
    // otherwise we handle it in the view via x-init
  },

  get hasPending() {
    return this.items.some((i) => i.status === 'pending')
  },

  init() {
    // Auto-select first category
    const firstChip = document.querySelector('.category-chip')
    if (firstChip) firstChip.click()
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
}))

// ─── Bill App ───
Alpine.data('billApp', (config) => ({
  orderId: config.orderId,
  total: config.total,
  paying: false,

  async pay(method) {
    if (this.paying) return
    this.paying = true
    try {
      const res = await fetch(`/api/orders/${this.orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/'
      }
    } catch (e) {
      console.error('Pay error:', e)
    } finally {
      this.paying = false
    }
  },
}))

// ─── Kitchen/Bar Display App ───
Alpine.data('kdsApp', (apiUrl, destination) => ({
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
}))

// ─── Nav App (Header, Drawer, Profile) ───
Alpine.data('navApp', () => ({
  drawerOpen: false,
  profileOpen: false,
  
  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  },
  
  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }
}))

// ─── Theme App ───
Alpine.data('themeApp', () => ({
  isDark: document.documentElement.classList.contains('dark'),
  
  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }
}))

Alpine.start()
