// For TypeScript
import SQLite from 'react-native-sqlite-storage';

const DATABASE_NAME = 'smart_pantry.db';
let db: SQLite.SQLiteDatabase | undefined;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  try {
    db = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
    console.log('Database opened successfully');
    await createTables(db);
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const createTables = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS InventoryItems (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL UNIQUE,
        product_name TEXT NOT NULL,
        quantity_in_possession INTEGER NOT NULL DEFAULT 1,
        location TEXT,
        expiration_date TEXT,
        notes TEXT,
        image_front_url TEXT,
        scan_timestamp INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
      );
    `);
    console.log('InventoryItems table created or already exists');

    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS UserLocations (
        location_id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name TEXT NOT NULL UNIQUE
      );
    `);
    console.log('UserLocations table created or already exists');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const addLocation = async (locationName: string): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    await db.executeSql('INSERT INTO UserLocations (location_name) VALUES (?)', [locationName]);
    console.log(`Location "${locationName}" added successfully`);
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

const getLocations = async (): Promise<Array<{ location_id: number; location_name: string }>> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const [results] = await db.executeSql('SELECT * FROM UserLocations ORDER BY location_name ASC');
    const locations: Array<{ location_id: number; location_name: string }> = [];
    if (results && results.rows) {
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        locations.push({ location_id: item.location_id, location_name: item.location_name });
      }
    }
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export { openDatabase, addLocation, getLocations }; // Don't forget to export the new function