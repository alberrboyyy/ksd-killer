import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Table from '#models/table'
import Category from '#models/category'
import Product from '#models/product'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // users
    await User.createMany([
      { username: 'admin', password: 'admin123', displayName: 'Patron', role: 'admin' },
      { username: 'albert', password: 'albert123', displayName: 'Albert', role: 'server' },
      { username: 'sarah', password: 'sarah123', displayName: 'Sarah', role: 'server' },
      { username: 'barman', password: 'barman123', displayName: 'Barman', role: 'bar' },
    ])

    // physical tables
    await Table.createMany([
      { number: 1, seats: 2 },
      { number: 2, seats: 2 },
      { number: 3, seats: 3 },
      { number: 4, seats: 4 },
      { number: 5, seats: 4 },
      { number: 6, seats: 4 },
      { number: 7, seats: 4 },
      { number: 8, seats: 6 },
      { number: 9, seats: 6 },
      { number: 10, seats: 6 },
      { number: 11, seats: 2 },
      { number: 12, seats: 2 },
      { number: 13, seats: 4 },
      { number: 14, seats: 4 },
      { number: 15, seats: 6 },
      { number: 101, seats: 2 },
      { number: 102, seats: 2 },
      { number: 103, seats: 4 },
      { number: 104, seats: 4 },
      { number: 105, seats: 6 },
    ])

    // virtual table for takeaway
    await Table.create({ number: 0, seats: 0, isVirtual: true })

    // categories
    const bar = await Category.create({ name: 'Bar' })
    const cuisine = await Category.create({ name: 'Cuisine' })
    const desserts = await Category.create({ name: 'Desserts' })

    const bieres = await Category.create({ name: 'Bières', parentId: bar.id })
    const softs = await Category.create({ name: 'Softs', parentId: bar.id })
    const vins = await Category.create({ name: 'Vins', parentId: bar.id })
    const chauds = await Category.create({ name: 'Boissons Chaudes', parentId: bar.id })

    const entrees = await Category.create({ name: 'Entrées', parentId: cuisine.id })
    const plats = await Category.create({ name: 'Plats', parentId: cuisine.id })

    // products
    await Product.createMany([
      // Bar - Softs
      { name: 'Coca-Cola 33cl', price: 4.5, categoryId: softs.id, destination: 'bar' },
      { name: 'Coca-Cola Zero 33cl', price: 4.5, categoryId: softs.id, destination: 'bar' },
      { name: 'Eau Gazeuse 50cl', price: 5.8, categoryId: softs.id, destination: 'bar' },
      { name: 'Eau Plate 50cl', price: 5.0, categoryId: softs.id, destination: 'bar' },
      { name: 'Jus d\'Orange', price: 5.0, categoryId: softs.id, destination: 'bar' },
      { name: 'Sirop', price: 3.0, categoryId: softs.id, destination: 'bar' },

      // Bar - Bières
      { name: 'Bière Blonde 25cl', price: 4.6, categoryId: bieres.id, destination: 'bar' },
      { name: 'Bière Blonde 50cl', price: 7.5, categoryId: bieres.id, destination: 'bar' },
      { name: 'Sportif 3dl', price: 3.5, categoryId: bieres.id, destination: 'bar' },
      { name: 'IPA 33cl', price: 6.5, categoryId: bieres.id, destination: 'bar' },

      // Bar - Vins
      { name: 'Verre de Rouge', price: 6.0, categoryId: vins.id, destination: 'bar' },
      { name: 'Verre de Blanc', price: 6.0, categoryId: vins.id, destination: 'bar' },
      { name: 'Bouteille Rouge', price: 28.0, categoryId: vins.id, destination: 'bar' },
      { name: 'Bouteille Blanc', price: 28.0, categoryId: vins.id, destination: 'bar' },

      // Bar - Boissons Chaudes
      { name: 'Café', price: 3.5, categoryId: chauds.id, destination: 'bar' },
      { name: 'Double Café', price: 4.5, categoryId: chauds.id, destination: 'bar' },
      { name: 'Thé', price: 4.0, categoryId: chauds.id, destination: 'bar' },
      { name: 'Cappuccino', price: 5.0, categoryId: chauds.id, destination: 'bar' },

      // Cuisine - Entrées
      { name: 'Soupe du Jour', price: 9.0, categoryId: entrees.id, destination: 'cuisine' },
      { name: 'Bruschetta', price: 11.0, categoryId: entrees.id, destination: 'cuisine' },
      { name: 'Salade Verte', price: 8.0, categoryId: entrees.id, destination: 'cuisine' },

      // Cuisine - Plats
      { name: 'Burger Maison', price: 22.0, categoryId: plats.id, destination: 'cuisine' },
      { name: 'Entrecôte 250g', price: 34.0, categoryId: plats.id, destination: 'cuisine' },
      { name: 'Salade César', price: 18.5, categoryId: plats.id, destination: 'cuisine' },
      { name: 'Fish & Chips', price: 19.0, categoryId: plats.id, destination: 'cuisine' },
      { name: 'Pâtes Carbonara', price: 17.0, categoryId: plats.id, destination: 'cuisine' },
      { name: 'Risotto Champignons', price: 20.0, categoryId: plats.id, destination: 'cuisine' },

      // Desserts
      { name: 'Tiramisu', price: 9.0, categoryId: desserts.id, destination: 'cuisine' },
      { name: 'Café Glacé', price: 12.0, categoryId: desserts.id, destination: 'cuisine' },
      { name: 'Crème Brûlée', price: 8.5, categoryId: desserts.id, destination: 'cuisine' },
      { name: 'Fondant Chocolat', price: 10.0, categoryId: desserts.id, destination: 'cuisine' },
    ])
  }
}
