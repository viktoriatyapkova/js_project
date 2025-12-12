import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';

const swaggerPath = path.join(process.cwd(), 'src', 'docs', 'openapi.yaml');

// Preload once; fall back to minimal spec to avoid crashes in tests/CI
const loadSpec = () => {
  try {
    const raw = fs.readFileSync(swaggerPath, 'utf8');
    return yaml.load(raw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Swagger spec load failed, using fallback for tests:', error.message);
    return {
      openapi: '3.0.0',
      info: { title: 'Choreo Notes API', version: '1.0.0' },
      paths: {},
    };
  }
};

const swaggerDocument = loadSpec();

const swaggerSetup = (app) => {
  // Skip mounting UI when running tests to prevent side effects
  if (process.env.NODE_ENV === 'test') return;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
};

export default swaggerSetup;



