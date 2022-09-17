import Dexie from 'dexie'

export const db = new Dexie('StockBrowserDB')

db.version(1).stores({
	products: 'id, name, flags',
	prices: 'id, unit, price',
	stocks: 'id, unit, total, aviable',
})

db.version(2).stores({
	products: 'id',
	prices: 'id',
	stocks: 'id',
})

db.version(3).stores({
	products: 'id',
	prices: 'id',
	stocks: 'id',
	sizes: 'id',
})
