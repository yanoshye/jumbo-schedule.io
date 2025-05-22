const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'jumbo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Eroare la conectarea la baza de date:', err.message);
  } else {
    console.log('Conectat la baza de date SQLite Jumbo.');
  }
});

module.exports = db;
