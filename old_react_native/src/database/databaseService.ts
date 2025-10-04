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
    await createTables(db);
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    const promises = [
      new Promise<SQLite.SQLResultSet>((resolve, reject) => {
        db.executeSql(
          `
            CREATE TABLE IF NOT EXISTS ProductDefinitions (
              product_id INTEGER PRIMARY KEY AUTOINCREMENT,
              barcode TEXT UNIQUE,
              product_name TEXT NOT NULL UNIQUE,
              image_front_url TEXT,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
              updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
            );
          `,
          [],
          (resultSet) => {
            console.log('ProductDefinitions table created or already exists');
            resolve(resultSet);
          },
          (error) => {
            console.error('Error creating ProductDefinitions table:', error);
            reject(error);
          }
        );
      }),
      new Promise<SQLite.SQLResultSet>((resolve, reject) => {
        db.executeSql(
          `
            CREATE TABLE IF NOT EXISTS InventoryItems (
              item_id INTEGER PRIMARY KEY AUTOINCREMENT,
              product_name TEXT NOT NULL,
              barcode TEXT,
              scan_timestamp INTEGER NOT NULL,
              expiration_date TEXT,
              location_id INTEGER,
              notes TEXT,
              quantity_in_possession REAL DEFAULT 1.0,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
              updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
              FOREIGN KEY (product_name) REFERENCES ProductDefinitions(product_name),
              FOREIGN KEY (location_id) REFERENCES UserLocations(location_id)
            );
          `,
          [],
          (resultSet) => {
            console.log('InventoryItems table created or already exists');
            resolve(resultSet);
          },
          (error) => {
            console.error('Error creating InventoryItems table:', error);
            reject(error);
          }
        );
      }),
      new Promise<SQLite.SQLResultSet>((resolve, reject) => {
        db.executeSql(
          `
            CREATE TABLE IF NOT EXISTS UserLocations (
              location_id INTEGER PRIMARY KEY AUTOINCREMENT,
              location_name TEXT NOT NULL UNIQUE
            );
          `,
          [],
          (resultSet) => {
            console.log('UserLocations table created or already exists');
            resolve(resultSet);
          },
          (error) => {
            console.error('Error creating UserLocations table:', error);
            reject(error);
          }
        );
      }),
    ];

    await Promise.all(promises);
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
const insertProductDefinition = async (
  barcode: string,
  productName: string | null,
  imageUrl: string | null
): Promise<void> => {
  const localDb = await openDatabase(); // Get the database instance

  console.log('Inside insertProductDefinition...');
  console.log('Barcode:', barcode);
  console.log('Product Name:', productName);
  console.log('Image URL:', imageUrl);

  if (!localDb) {
    throw new Error('Database not initialized in insertProductDefinition');
  }

  try {
    const query = `
      INSERT OR REPLACE INTO ProductDefinitions (barcode, product_name, image_front_url)
      VALUES (?, ?, ?);
    `;
    const params = [barcode, productName, imageUrl];

    console.log('Executing SQL:', query, params);

    await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
      localDb.executeSql(
        query,
        params,
        (resultSet) => {
          console.log('executeSql success:', resultSet);
          resolve(resultSet);
        },
        (error) => {
          console.error('executeSql error:', error);
          reject(error);
        }
      );
    })
      .then((results) => {
        console.log('Results from executeSql (promise):', results);
        if (results && results.rowsAffected > 0) {
          console.log('Product definition inserted or replaced successfully');
        } else {
          console.log('Product definition NOT inserted or no rows affected (promise).');
        }
      })
      .catch((error) => {
        console.error('Error during executeSql promise:', error);
        throw error;
      });
  } catch (error) {
    console.error('Error in insertProductDefinition (outer catch):', error);
    throw error;
  }
};

// databaseService.ts

export const updateProductDefinitionName = async (barcode: string, productName: string): Promise<void> => {
  const db = await openDatabase();
  if (db) {
    try {
      console.log("Barcode before update:", barcode); // Added log
      const results = await db.executeSql(
        'UPDATE ProductDefinitions SET product_name = ? WHERE barcode = ?',
        [productName, barcode]
      );
      console.log("Barcode after update:", barcode); // Added log
      console.log(`Product name updated for barcode: ${barcode}`, results);
    } catch (error) {
      console.error('Error updating product name:', error);
      throw error;
    }
  } else {
    console.error('Failed to open database.');
    throw new Error('Failed to open database.');
  }
};

const addInventoryItem = async (
  barcode: string | null,
  scanTimestamp: number,
  quantityInPossession: number,
  locationId: number | null,
  expirationDate: string | null,
  notes: string | null,
  productName: string | null = null,
  uniqueItemCode: string | null = null
): Promise<void> => {
  const currentDb = await openDatabase();

  console.log('Product Name inside addInventoryItem:', productName); // Correct placement
  console.log('Inside addInventoryItem...');
  console.log('Barcode:', barcode);
  console.log('Scan Timestamp:', scanTimestamp);
  console.log('Quantity in Possession:', quantityInPossession);
  console.log('Location ID:', locationId);
  console.log('Expiration Date:', expirationDate);
  console.log('Notes:', notes);

  if (!currentDb) {
    throw new Error('Database not initialized in addInventoryItem');
  }
  try {
      console.log('productName right before insert', productName); // added log
      const roundedQuantity = parseFloat(quantityInPossession.toFixed(2));

    const query = `
      INSERT INTO InventoryItems (
          product_name,
        barcode,
        scan_timestamp,
        quantity_in_possession,
        location_id,
        expiration_date,
        notes
      ) VALUES (?,?, ?, ?, ?, ?, ?)
      `;
    const params = [
      productName,
      barcode,
      scanTimestamp,
      roundedQuantity,
      locationId,
      expirationDate,
      notes,
    ];

    console.log('Executing SQL:', query, params);

    await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
      currentDb.executeSql(
        query,
        params,
        (resultSet) => {
          console.log('executeSql success:', resultSet);
          resolve(resultSet);
        },
        (error) => {
          console.error('executeSql error:', error);
          reject(error);
        }
      );
    })
      .then((results) => {
        console.log('Results from executeSql (promise):', results);
        if (results && results.rowsAffected > 0) {
          console.log('Inventory item added successfully');
        } else {
          console.log('Inventory item NOT added or no rows affected (promise).');
        }
      })
      .catch((error) => {
        console.error('Error during executeSql promise:', error);
        throw error;
      });
  } catch (error) {
    console.error('Error in addInventoryItem (outer catch):', error);
    throw error;
  }
};

const addLocation = async (locationName: string): Promise<void> => {
  const currentDb = await openDatabase();

  console.log('Inside addLocation...');
  console.log('Location Name:', locationName);

  if (!currentDb) {
    throw new Error('Database not initialized in addLocation');
  }

  try {
    const query = 'INSERT INTO UserLocations (location_name) VALUES (?)';
    const params = [locationName];

    console.log('Executing SQL:', query, params);

    await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
      currentDb.executeSql(
        query,
        params,
        (resultSet) => {
          console.log('executeSql success:', resultSet);
          resolve(resultSet);
        },
        (error) => {
          console.error('executeSql error:', error);
          reject(error);
        }
      );
    })
      .then((results) => {
        console.log('Results from executeSql (promise):', results);
        if (results && results.rowsAffected > 0) {
          console.log(`Location "${locationName}" added successfully`);
        } else {
          console.log(`Location "${locationName}" NOT added or no rows affected (promise).`);
        }
      })
      .catch((error) => {
        console.error('Error during executeSql promise:', error);
        throw error;
      });
  } catch (error) {
    console.error('Error in addLocation (outer catch):', error);
    throw error;
  }
};

const getLocations = async (): Promise<Array<{ location_id: number; location_name: string }>> => {
  const currentDb = await openDatabase(); // ADD THIS LINE
  console.log('Inside getLocations, db object:', currentDb); // Update log

  if (!currentDb) {
    throw new Error('Database not initialized');
  }
  try {
    const query = 'SELECT * FROM UserLocations ORDER BY location_name ASC';
    const params: [] = []; // Empty array for parameters

    const dbResult: SQLite.SQLResultSet = await new Promise((resolve, reject) => {
      currentDb!.executeSql(query, params, (resultSet) => { // Use currentDb!
        resolve(resultSet);
      }, (error) => {
        reject(error);
      });
    });

    console.log('dbResult from executeSql:', dbResult); // Keep this

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
  const currentDb = await openDatabase(); // ADD THIS LINE
  if (!currentDb) {
    throw new Error('Database not initialized');
  }
  try {
    await currentDb.executeSql('DELETE FROM UserLocations WHERE location_id = ?', [locationId]);
    console.log(`Location with ID ${locationId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting location with ID ${locationId}:`, error);
    throw error;
  }
};

const updateInventoryItem = async (
  itemId: number,
  quantity: number,
  locationId: number | null
): Promise<void> => {
  const currentDb = await openDatabase();
  if (!currentDb) {
    throw new Error('Database not initialized');
  }
  try {
    const roundedQuantity = parseFloat(quantity.toFixed(2)); // Round to 2 decimal places in JavaScript
    console.log("Rounded quantity:", roundedQuantity);
    await currentDb.executeSql(
      'UPDATE InventoryItems SET quantity_in_possession = ?, location_id = ? WHERE item_id = ?',
      [roundedQuantity, locationId, itemId]
    );
    console.log(`Inventory item ${itemId} updated successfully`);
  } catch (error) {
    console.error(`Error updating inventory item ${itemId}:`, error);
    throw error;
  }
};

interface InventoryItem {
  item_id: number;
  product_name: string;
  barcode: string;
  scan_timestamp: number;
  expiration_date: string | null;
  location_id: number | null;
  notes: string | null;
  quantity_in_possession: number;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

const getInventoryItems = async (
  locationId: number | null,
  createdFrom: number | null,
  createdTo: number | null,
  quantityMin: number,
  quantityMax: number
): Promise<InventoryItem[]> => {
  const db = await openDatabase();
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    let query = `
      SELECT InventoryItems.*, ProductDefinitions.image_front_url
      FROM InventoryItems
      LEFT JOIN ProductDefinitions ON InventoryItems.barcode = ProductDefinitions.barcode
    `;
    const queryParams: any[] = [];
    const whereClauses: string[] = [];

    if (locationId) {
      whereClauses.push('InventoryItems.location_id = ?');
      queryParams.push(locationId);
    }

    if (createdFrom) {
      whereClauses.push('InventoryItems.created_at >= ?');
      queryParams.push(createdFrom);
    }

    if (createdTo) {
      whereClauses.push('InventoryItems.created_at <= ?');
      queryParams.push(createdTo);
    }

    whereClauses.push('InventoryItems.quantity_in_possession >= ? AND InventoryItems.quantity_in_possession <= ?');
    queryParams.push(quantityMin, quantityMax);

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const inventoryResults = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
      db.executeSql(query, queryParams, (resultSet) => resolve(resultSet), (error) => reject(error));
    });

    const items: InventoryItem[] = [];
    for (let i = 0; i < inventoryResults.rows.length; i++) {
      items.push({
        ...inventoryResults.rows.item(i),
        image_url: inventoryResults.rows.item(i).image_front_url,
      });
    }

    return items;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

export {
  openDatabase,
  addLocation,
  getLocations,
  deleteLocation,
  addInventoryItem,
  insertProductDefinition,
  updateProductDefinitionName,
  updateInventoryItem,
  getInventoryItems, // Export the new function
};