import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    isConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  },
  services: {
    ocrApiKey: process.env.OCR_API_KEY || '',
    aiApiKey: process.env.AI_API_KEY || '',
    mapsApiKey: process.env.MAPS_API_KEY || ''
  }
};
