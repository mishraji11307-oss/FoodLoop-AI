import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { httpLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(httpLogger);
}

// Mount REST API endpoints
app.use('/api/v1', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    name: 'FoodLoop AI API',
    tagline: 'Track. Understand. Share.',
    version: '1.0.0',
    documentation: '/docs/API.md',
    api_root: '/api/v1'
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 FoodLoop AI API Server running on port ${config.port}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`📡 Base URL: http://localhost:${config.port}/api/v1`);
    console.log(`====================================================`);
  });
}

export default app;
