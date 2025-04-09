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
      CREATE TABLE IF NOT EXISTS ProductDefinitions (
    barcode TEXT NOT NULL UNIQUE PRIMARY KEY,
    product_name TEXT NOT NULL,
    image_front_url TEXT,
    quantity TEXT, -- e.g., "1.5 oz", "1 liter", "6 count"
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    -- Add other relevant product details here as needed
    );`);
    console.log('ProductDefinitions table created or already exists');

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS InventoryItems (
         item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      scan_timestamp INTEGER NOT NULL,
      expiration_date TEXT,
      location_id INTEGER, -- Foreign key to UserLocations
      notes TEXT,
      quantity_in_possession REAL DEFAULT 1.0, -- Defined as REAL here
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
      FOREIGN KEY (barcode) REFERENCES ProductDefinitions(barcode),
      FOREIGN KEY (location_id) REFERENCES UserLocations(location_id)
      );`);

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

const deleteLocation = async (locationId: number): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    await db.executeSql('DELETE FROM UserLocations WHERE location_id = ?', [locationId]);
    console.log(`Location with ID ${locationId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting location with ID ${locationId}:`, error);
    throw error;
  }
};

export { openDatabase, addLocation, getLocations, deleteLocation };