import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'choreo_user',
  password: process.env.DB_PASSWORD || 'choreo_password',
  database: process.env.DB_NAME || 'choreo_notes',
  // Добавляем таймауты для лучшей диагностики
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Не завершаем процесс, чтобы сервер мог продолжать работать
  // process.exit(-1);
});

// Функция для проверки подключения
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Please check:');
    console.error('1. Docker container is running: docker ps');
    console.error('2. .env file exists with correct DB credentials');
    console.error('3. Database is initialized: docker-compose up -d');
    return false;
  }
};

export default pool;

