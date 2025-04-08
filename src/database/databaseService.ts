// For TypeScript
import SQLite from 'react-native-sqlite-storage';

const DATABASE_NAME = 'smart_pantry.db';
let db: SQLite.SQLiteDatabase | undefined; // Keep 'db'

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  try {
    db = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
    console.log('Database opened successfully');
    await createTables(db); // Pass 'db' here
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => { // Rename parameter to 'db'
  try {
    await db.executeSql(`
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

    await db.executeSql(`
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

  try {
    await db.executeSql('INSERT INTO UserLocations (location_name) VALUES (?)', ['Debug Location 1']);
    await db.executeSql('INSERT INTO UserLocations (location_name) VALUES (?)', ['Debug Location 2']);
    console.log('Debug data inserted into UserLocations');
  } catch (error) {
    console.error('Error inserting debug data:', error);
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
  console.log('Inside getLocations, db object:', db); // Keep this for potential future debugging

  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const query = 'SELECT * FROM UserLocations ORDER BY location_name ASC';
    const params: [] = []; // Empty array for parameters

    const dbResult: SQLite.SQLResultSet = await new Promise((resolve, reject) => {
      db!.executeSql(query, params, (resultSet) => {
        resolve(resultSet);
      }, (error) => {
        reject(error);
      });
    });

    console.log('dbResult from executeSql:', dbResult); // Keep this for potential future debugging

    const locations: Array<{ location_id: number; location_name: string }> = [];
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      for (let i = 0; i < dbResult.rows.length; i++) {
        const item = dbResult.rows.item(i);
        locations.push({ location_id: item.location_id, location_name: item.location_name });
      }
    }
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export { openDatabase, addLocation, getLocations };