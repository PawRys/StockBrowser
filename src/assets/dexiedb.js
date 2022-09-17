import Dexie from 'dexie'

export const db = new Dexie('StockBrowserDB')

db.version(1).stores({
	products: 'id, name, flags',
	stocks: 'id, unit, total, aviable',
	prices: 'id, unit, price',
})
