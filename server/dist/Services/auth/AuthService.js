"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(data) {
        // Provera da li već postoji korisnik sa tom email adresom
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('Email already in use');
        }
        // Provera da li postoji korisnik sa tim korisničkim imenom
        const existingUsername = await this.userRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new Error('Username already taken');
        }
        // Hesiranje lozinke
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // Kreiranje korisnika
        const user = await this.userRepository.create({
            username: data.username,
            email: data.email,
            password: hashedPassword
        });
        // Generisanje tokena
        const token = this.generateToken(user);
        // Ukloni lozinku iz odgovora
        // @ts-ignore
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(data) {
        // Pronađi korisnika po email-u
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Proveri lozinku
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        // Generiši token
        const token = this.generateToken(user);
        // Ukloni lozinku iz odgovora
        // @ts-ignore
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await this.userRepository.findById(decoded.userId);
            return user;
        }
        catch (error) {
            return null;
        }
    }
    generateToken(user) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        const payload = { userId: user.id };
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
}
exports.AuthService = AuthService;
