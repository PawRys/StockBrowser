import Dexie from 'dexie';

export const db = new Dexie('StockBrowserDB');

db.version(1).stores({
	products: 'code, tCub, aCub',
});
db.version(2).stores({
	products: 'code, tCub, aCub',
	timestamps: 'id',
});
db.version(3).stores({
	products: 'code, tCub, aCub',
	timestamps: 'id',
	settings: 'id',
});
