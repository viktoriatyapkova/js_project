import pool, { testConnection } from './src/utils/database.js';

async function checkDatabase() {
  console.log('Checking database connection...');
  console.log('DB Config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'choreo_user',
    database: process.env.DB_NAME || 'choreo_notes',
  });

  const connected = await testConnection();
  
  if (connected) {
    try {
      // Проверяем наличие таблиц
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nTables in database:');
      if (result.rows.length === 0) {
        console.log('  No tables found. Database needs initialization.');
        console.log('  Run: docker exec -i choreo-notes-db psql -U choreo_user -d choreo_notes < init.sql');
      } else {
        result.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      }
    } catch (error) {
      console.error('Error checking tables:', error.message);
    }
  }
  
  await pool.end();
  process.exit(connected ? 0 : 1);
}

checkDatabase();



