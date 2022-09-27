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

db.version(4).stores({
	products: 'id',
	prices: 'id',
	stocks: 'id',
	sizes: null,
	sizeCodes: 'id',
})

db.version(5).stores({
	products: 'id',
	prices: 'id',
	stocks: 'id, aviable',
	sizeCodes: 'id',
})

db.version(6).stores({
	products: 'id',
	prices: null,
	stocks: null,
	sizeCodes: null,
})

db.version(7).stores({
	products: 'id, total, aviable',
})
