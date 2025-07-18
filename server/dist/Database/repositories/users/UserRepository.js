"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = require("../../../Domain/models/User");
const DbConnectionPool_1 = require("../../connection/DbConnectionPool");
class UserRepository {
    constructor() {
        this.repository = DbConnectionPool_1.AppDataSource.getRepository(User_1.User);
    }
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return await this.repository.findOne({ where: { email } });
    }
    async findByUsername(username) {
        return await this.repository.findOne({ where: { username } });
    }
    async create(userData) {
        const user = this.repository.create(userData);
        return await this.repository.save(user);
    }
    async update(id, userData) {
        await this.repository.update(id, userData);
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
}
exports.UserRepository = UserRepository;
