import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';
import { testConnection } from './Database/connection/DbConnectionPool';
import fs from 'fs';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await testConnection();
    console.log('✅ Database connected');

    // Ensure uploads dir
    const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
    }

    // App instance
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🚀 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
