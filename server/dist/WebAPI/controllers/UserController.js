"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserRepository_1 = require("../../Database/repositories/users/UserRepository");
class UserController {
    constructor() {
        this.getProfile = async (req, res) => {
            try {
                const userId = req.params.id;
                const user = await this.userRepository.findById(userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                // Izbacujemo password iz odgovora
                const { password, ...userWithoutPassword } = user;
                res.json({
                    success: true,
                    data: userWithoutPassword
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
                // Provera da li username već postoji (ako se menja)
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
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.userRepository = new UserRepository_1.UserRepository();
    }
}
exports.UserController = UserController;
