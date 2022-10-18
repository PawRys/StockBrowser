import Dexie from 'dexie'

export const db = new Dexie('StockBrowserDB')

db.version(1).stores({
	products: 'id, tCub, aCub',
})
