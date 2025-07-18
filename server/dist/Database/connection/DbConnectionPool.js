"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const User_1 = require("../../Domain/models/User");
const Image_1 = require("../../Domain/models/Image");
const Collection_1 = require("../../Domain/models/Collection");
const Comment_1 = require("../../Domain/models/Comment");
const Like_1 = require("../../Domain/models/Like");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'pintrest_db',
    synchronize: true,
    logging: false,
    entities: [User_1.User, Image_1.Image, Collection_1.Collection, Comment_1.Comment, Like_1.Like],
    migrations: ['src/Database/migrations/*.ts'],
    subscribers: [],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('✅ Database connection initialized successfully');
    }
    catch (error) {
        console.error('❌ Error initializing database connection:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
