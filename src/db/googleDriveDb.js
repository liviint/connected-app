export const exportDatabase = async (db) => {
  const exportData = {};

  // Get tables
  const tablesResult = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table';"
  );

  const tables = tablesResult
    .map(t => t.name)
    .filter(name => name !== "sqlite_sequence");

  for (const table of tables) {
    const rows = await db.getAllAsync(`SELECT * FROM ${table}`);
    exportData[table] = rows;
  }

  return exportData;
};

const importDatabase = async (db, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      Object.keys(data).forEach(table => {
        // ⚠️ Clear table
        tx.executeSql(`DELETE FROM ${table}`);

        data[table].forEach(row => {
          const columns = Object.keys(row);
          const values = Object.values(row);

          const placeholders = columns.map(() => "?").join(",");

          tx.executeSql(
            `INSERT INTO ${table} (${columns.join(",")}) VALUES (${placeholders})`,
            values
          );
        });
      });
    },
    reject,
    resolve);
  });
};