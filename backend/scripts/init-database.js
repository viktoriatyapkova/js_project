import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/utils/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeCommandsIndividually(client, sql) {
  // Разбиваем на команды, учитывая многострочные конструкции
  const commands = [];
  let currentCommand = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    
    // Отслеживаем строки
    if ((char === "'" || char === '"') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    currentCommand += char;
    
    // Если точка с запятой вне строки - это конец команды
    if (char === ';' && !inString) {
      const trimmed = currentCommand.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        commands.push(trimmed);
      }
      currentCommand = '';
    }
  }
  
  // Выполняем команды по порядку
  for (const command of commands) {
    if (command.trim()) {
      try {
        await client.query(command);
      } catch (error) {
        // Игнорируем ошибки, если объект уже существует
        if (error.code === '42P07' || error.code === '42710') {
          // Пропускаем
        } else {
          console.error(`Error executing: ${command.substring(0, 100)}...`);
          throw error;
        }
      }
    }
  }
}

async function initDatabase() {
  let client;
  
  try {
    console.log('Connecting to database...');
    console.log('DB Config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'choreo_user',
      database: process.env.DB_NAME || 'choreo_notes',
    });

    client = await pool.connect();
    console.log('✓ Connected successfully!');

    // Читаем SQL файл
    const sqlPath = path.join(__dirname, '..', 'init.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\nExecuting SQL script...');
    
    // Выполняем весь SQL скрипт целиком
    // PostgreSQL сам обработает все команды в правильном порядке
    try {
      await client.query(sql);
      console.log('✓ SQL script executed successfully');
    } catch (error) {
      // Если некоторые объекты уже существуют, это нормально
      if (error.code === '42P07' || error.code === '42710' || error.code === '42P01') {
        console.log('  ⚠ Some objects may already exist, continuing...');
        // Попробуем выполнить команды по отдельности
        await executeCommandsIndividually(client, sql);
      } else {
        throw error;
      }
    }
    
    console.log('✓ Database initialized successfully!');

    // Проверяем созданные таблицы
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nCreated tables:');
    if (result.rows.length === 0) {
      console.log('  ⚠ No tables found!');
    } else {
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }

    // Проверяем типы
    const typesResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname;
    `);

    if (typesResult.rows.length > 0) {
      console.log('\nCreated types:');
      typesResult.rows.forEach(row => {
        console.log(`  ✓ ${row.typname}`);
      });
    }

    console.log('\n✅ Database initialization complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error initializing database:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Make sure PostgreSQL is running:');
      console.error('   docker-compose up -d');
    } else if (error.code === '28P01') {
      console.error('\n💡 Solution: Check your .env file credentials');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solution: Database does not exist. Check DB_NAME in .env');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

initDatabase();
