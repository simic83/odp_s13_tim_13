"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const DbConnectionPool_1 = require("./Database/connection/DbConnectionPool");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Initialize database
        await (0, DbConnectionPool_1.initializeDatabase)();
        console.log('✅ Database connected');
        // Create uploads directory if it doesn't exist
        const uploadsDir = path_1.default.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Uploads directory created');
        }
        // Create and start Express app
        const app = (0, app_1.createApp)();
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🚀 API available at http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
