
async function setupDatabase() {
    // Importación dinámica para obtener la librería
    const DatabaseModule = await import('better-sqlite3');
    const Database = DatabaseModule.default;

    const db = new Database('db/database.db');
    
    // Comando SQL para crear la tabla si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT,
        timestamp DATETIME,
        ip TEXT
      )
    `);
    
    db.close();
    console.log("Base de datos de contactos creada y lista.");
}

// Ejecutamos la función
setupDatabase();