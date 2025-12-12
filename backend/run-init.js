const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runInitSQL() {
  console.log('📦 Running database initialization script...');
  
  // Читаем SQL файл
  const sqlFilePath = path.join(__dirname, 'init.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ File not found: ${sqlFilePath}`);
    console.log('💡 Make sure init.sql exists in the same directory');
    return;
  }
  
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'choreo_user',
    password: process.env.DB_PASSWORD || 'choreo_password',
    database: process.env.DB_NAME || 'choreo_notes'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Разбиваем SQL на отдельные команды (для лучшей обработки)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`📝 Found ${commands.length} SQL commands to execute`);
    
    // Выполняем каждую команду
    for (let i = 0; i < commands.length; i++) {
      try {
        console.log(`   [${i + 1}/${commands.length}] Executing...`);
        await client.query(commands[i] + ';');
      } catch (err) {
        // Игнорируем ошибки типа "уже существует" для IF NOT EXISTS
        if (!err.message.includes('already exists') && 
            !err.message.includes('exists') &&
            !err.message.includes('type "difficulty_level" already exists')) {
          console.warn(`   ⚠️  Warning on command ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ SQL script executed');
    
    // Проверяем, что таблицы созданы
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Проверяем существование enum типа
    try {
      const enumResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'difficulty_level'
        ) as exists;
      `);
      console.log(`\n🎭 Enum type 'difficulty_level': ${enumResult.rows[0].exists ? '✅ Created' : '❌ Missing'}`);
    } catch (e) {
      console.log(`\n🎭 Enum type check skipped: ${e.message}`);
    }
    
    // Добавляем тестовые данные
    console.log('\n👤 Adding test data...');
    try {
      // Вставляем тестового пользователя
      await client.query(`
        INSERT INTO users (email, password_hash, username) 
        VALUES (
          'test@example.com', 
          '$2b$10$7V2u8cB8Qq5uV6Qe6y5Z0e8YV5X8q2Z5V0u8cB8Qq5uV6Qe6y5Z0e', 
          'TestChoreographer'
        ) ON CONFLICT (email) DO NOTHING;
      `);
      
      // Вставляем тестовые движения
      await client.query(`
        INSERT INTO moves (name, description, video_url, difficulty_level, user_id) 
        VALUES 
        ('Pirouette', 'Basic spinning turn', 'https://youtube.com/watch?v=abc123', 'intermediate', 1),
        ('Grand Jeté', 'Big leap with legs split', 'https://youtube.com/watch?v=def456', 'advanced', 1),
        ('Plie', 'Basic knee bend', 'https://youtube.com/watch?v=ghi789', 'beginner', 1)
        ON CONFLICT DO NOTHING;
      `);
      
      // Вставляем тестовую связку
      await client.query(`
        INSERT INTO routines (name, description, duration_minutes, user_id)
        VALUES ('Morning Warmup', 'Daily warmup routine', 15, 1)
        ON CONFLICT DO NOTHING;
      `);
      
      // Связываем движения со связкой
      await client.query(`
        INSERT INTO routine_moves (routine_id, move_id, order_index)
        VALUES 
        (1, 1, 1),
        (1, 2, 2),
        (1, 3, 3)
        ON CONFLICT DO NOTHING;
      `);
      
      console.log('✅ Test data added');
      console.log('\n🔑 Test credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: testpassword123');
      
    } catch (dataError) {
      console.log('ℹ️  Test data already exists or error:', dataError.message);
    }
    
    await client.end();
    console.log('\n🎉 Database initialization complete!');
    console.log('   Run: npm run dev  - to start the server');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your .env file credentials');
    console.log('3. Try creating user/database manually:');
    console.log(`
   psql -U postgres
   CREATE USER choreo_user WITH PASSWORD 'choreo_password';
   CREATE DATABASE choreo_notes;
   \\c choreo_notes
   GRANT ALL PRIVILEGES ON DATABASE choreo_notes TO choreo_user;
    `);
  }
}

runInitSQL();   