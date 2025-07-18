"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const AuthService_1 = require("../../Services/auth/AuthService");
const UserRepository_1 = require("../../Database/repositories/users/UserRepository");
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                    return;
                }
                const { user, token } = await this.authService.register(req.body);
                // Skloni password iz odgovora
                const { password, ...userWithoutPassword } = user;
                res.status(201).json({
                    success: true,
                    data: {
                        ...userWithoutPassword,
                        token
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                    return;
                }
                const { user, token } = await this.authService.login(req.body);
                // Skloni password iz odgovora
                const { password, ...userWithoutPassword } = user;
                res.json({
                    success: true,
                    data: {
                        ...userWithoutPassword,
                        token
                    }
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
        };
        this.me = async (req, res) => {
            try {
                const { password, ...userWithoutPassword } = req.user;
                res.json({
                    success: true,
                    data: {
                        ...userWithoutPassword,
                        token: req.header('Authorization')?.replace('Bearer ', '')
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.updateProfile = async (req, res) => {
            try {
                if (req.user.id !== req.params.id) {
                    res.status(403).json({
                        success: false,
                        error: 'Access denied'
                    });
                    return;
                }
                const { username, bio, profileImage } = req.body;
                // Validate username if provided
                if (username && username !== req.user.username) {
                    const existingUser = await this.userRepository.findByUsername(username);
                    if (existingUser) {
                        res.status(400).json({
                            success: false,
                            error: 'Username already taken'
                        });
                        return;
                    }
                }
                const updatedUser = await this.userRepository.update(req.user.id, {
                    username,
                    bio,
                    profileImage
                });
                if (!updatedUser) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                const { password, ...userWithoutPassword } = updatedUser;
                res.json({
                    success: true,
                    data: userWithoutPassword
                });
            }
            catch (error) {
                console.error('Error in updateProfile:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.userRepository = new UserRepository_1.UserRepository();
        this.authService = new AuthService_1.AuthService(this.userRepository);
    }
}
exports.AuthController = AuthController;
