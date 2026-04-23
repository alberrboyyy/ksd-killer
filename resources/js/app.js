import Alpine from 'alpinejs'
import orderApp from './order'
import kdsApp from './kds'

// ─── Alpine Components ───
Alpine.data('orderApp', orderApp)
Alpine.data('kdsApp', kdsApp)

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
