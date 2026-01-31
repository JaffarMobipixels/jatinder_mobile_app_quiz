// import SQLite from 'react-native-sqlite-storage';

// SQLite.DEBUG(true);
// SQLite.enablePromise(true);

// const database_name = "DailyApp.db";
// const database_version = "1.0";
// const database_displayname = "Daily App DB";
// const database_size = 200000;

// export const getDBConnection = async () => {
//   return SQLite.openDatabase(
//     database_name,
//     database_version,
//     database_displayname,
//     database_size
//   );
// };

// // Example: Create table for questionnaires
// export const createTables = async (db: SQLite.SQLiteDatabase) => {
//   const query = `CREATE TABLE IF NOT EXISTS Questionnaires(
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     question TEXT,
//     answer TEXT
//   );`;
//   await db.executeSql(query);
// };
