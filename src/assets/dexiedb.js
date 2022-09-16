import Dexie from 'dexie';

export const db = new Dexie('StockBrowserDB');
db.version(1).stores({
  friends: '++id, name, age', // Primary key and indexed props
  products: 'id, name, flags',
});