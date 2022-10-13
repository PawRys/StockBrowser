import Dexie from 'dexie'

export const db = new Dexie('StockBrowserDB')

db.version(1).stores({
	products: 'id, total_m3, aviable_m3',
})
