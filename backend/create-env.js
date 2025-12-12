import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=choreo_user
DB_PASSWORD=choreo_password
DB_NAME=choreo_notes

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('File .env already exists');
  process.exit(0);
}

try {
  fs.writeFileSync(envPath, envContent);
  console.log('File .env created successfully!');
  console.log('Location:', envPath);
} catch (error) {
  console.error('Error creating .env file:', error.message);
  process.exit(1);
}



